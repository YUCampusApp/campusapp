package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.dto.CreateLibraryReservationRequest;
import com.yeditepe.campusapp.dto.LibraryPolicyStatusResponse;
import com.yeditepe.campusapp.dto.LibraryReservationResponse;
import com.yeditepe.campusapp.dto.LibrarySlotResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MockLibraryService {

    private record SlotModel(Long slotId, LocalDate date, LocalTime start, LocalTime end) {}
    private record ReservationModel(Long id, Long slotId, String studentNo, Instant createdAt, String status, LocalDate date, LocalTime start, LocalTime end) {}

    private final AtomicLong reservationIdSeq = new AtomicLong(1);
    private final AtomicLong slotIdSeq = new AtomicLong(1000);

    private final Map<String, List<SlotModel>> slotsByDateKey = new ConcurrentHashMap<>();
    private final Map<Long, SlotModel> slotById = new ConcurrentHashMap<>();
    private final Map<Long, ReservationModel> reservationById = new ConcurrentHashMap<>();

    /** After a no-show, student cannot create new reservations until this instant (UTC). */
    private final Map<String, Instant> reserveBlockedUntil = new ConcurrentHashMap<>();

    private static final int CAPACITY = 20;

    private static final String NO_SHOW_BAN_MSG =
            "Rezervasyon yaptığınız halde kütüphaneye gelmediniz. 7 gün süreyle yeni rezervasyon oluşturamazsınız.";

    private static String dateKey(LocalDate d) {
        return d.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private List<SlotModel> ensureSlots(LocalDate date) {
        return slotsByDateKey.computeIfAbsent(dateKey(date), k -> {
            List<SlotModel> list = new ArrayList<>();
            LocalTime cursor = LocalTime.of(9, 0);
            while (cursor.isBefore(LocalTime.of(17, 0))) {
                LocalTime start = cursor;
                LocalTime end = cursor.plusHours(2);
                if (end.isAfter(LocalTime.of(18, 0))) break;
                long id = slotIdSeq.getAndIncrement();
                SlotModel model = new SlotModel(id, date, start, end);
                list.add(model);
                slotById.put(id, model);
                cursor = end;
            }
            return list;
        });
    }

    /** Mark BOOKED reservations as NO_SHOW after slot end; apply 7-day ban. */
    public void sweepNoShows() {
        LocalDateTime now = LocalDateTime.now();
        for (ReservationModel r : new ArrayList<>(reservationById.values())) {
            if (!"BOOKED".equals(r.status())) {
                continue;
            }
            LocalDateTime slotEnd = LocalDateTime.of(r.date(), r.end());
            if (now.isAfter(slotEnd)) {
                ReservationModel updated = new ReservationModel(
                        r.id(), r.slotId(), r.studentNo(), r.createdAt(), "NO_SHOW", r.date(), r.start(), r.end());
                reservationById.put(r.id(), updated);
                Instant until = Instant.now().plus(7, ChronoUnit.DAYS);
                reserveBlockedUntil.merge(r.studentNo(), until, (a, b) -> a.isAfter(b) ? a : b);
            }
        }
    }

    public LibraryPolicyStatusResponse policyStatusForStudent(String studentNo) {
        sweepNoShows();
        Instant until = reserveBlockedUntil.get(studentNo);
        boolean blocked = until != null && Instant.now().isBefore(until);
        return new LibraryPolicyStatusResponse(
                blocked,
                blocked && until != null ? until.toString() : null,
                blocked ? NO_SHOW_BAN_MSG : null
        );
    }

    public List<LibraryReservationResponse> listMyReservations(String studentNo) {
        sweepNoShows();
        return reservationById.values().stream()
                .filter(r -> r.studentNo().equals(studentNo))
                .sorted(
                        Comparator.comparing(ReservationModel::date).reversed()
                                .thenComparing(Comparator.comparing(ReservationModel::id).reversed()))
                .map(this::toDto)
                .toList();
    }

    public List<LibrarySlotResponse> getSlots(LocalDate date) {
        sweepNoShows();
        List<SlotModel> slots = ensureSlots(date);
        DateTimeFormatter tFmt = DateTimeFormatter.ofPattern("HH:mm");

        List<LibrarySlotResponse> out = new ArrayList<>();
        for (SlotModel s : slots) {
            long booked = reservationById.values().stream()
                    .filter(r -> r.slotId().equals(s.slotId()) && isOccupyingSeat(r.status()))
                    .count();
            int emptySeats = Math.max(0, CAPACITY - (int) booked);
            double occupancyRate = (double) booked / CAPACITY;

            LibrarySlotResponse dto = new LibrarySlotResponse();
            dto.setSlotId(s.slotId());
            dto.setStartTime(s.start().format(tFmt));
            dto.setEndTime(s.end().format(tFmt));
            dto.setEmptySeats(emptySeats);
            dto.setOccupancyRate(Math.round(occupancyRate * 100.0) / 100.0);
            out.add(dto);
        }

        out.sort(Comparator.comparing(LibrarySlotResponse::getStartTime));
        return out;
    }

    private static boolean isOccupyingSeat(String status) {
        return "BOOKED".equals(status) || "CONFIRMED".equals(status) || "NO_SHOW".equals(status);
    }

    public LibraryReservationResponse reserve(String studentNo, CreateLibraryReservationRequest request) {
        sweepNoShows();

        Instant banUntil = reserveBlockedUntil.get(studentNo);
        if (banUntil != null && Instant.now().isBefore(banUntil)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, NO_SHOW_BAN_MSG);
        }

        SlotModel slot = slotById.get(request.getSlotId());
        if (slot == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot not found.");
        }

        boolean sameDayActive = reservationById.values().stream()
                .anyMatch(r -> r.studentNo().equals(studentNo)
                        && r.date().equals(slot.date())
                        && ("BOOKED".equals(r.status()) || "CONFIRMED".equals(r.status())));
        if (sameDayActive) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Aynı gün için yalnızca bir rezervasyon yapabilirsiniz."
            );
        }

        long booked = reservationById.values().stream()
                .filter(r -> r.slotId().equals(slot.slotId()) && isOccupyingSeat(r.status()))
                .count();
        if (booked >= CAPACITY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No empty seats available.");
        }

        long id = reservationIdSeq.getAndIncrement();
        ReservationModel model = new ReservationModel(id, slot.slotId(), studentNo, Instant.now(), "BOOKED", slot.date(), slot.start(), slot.end());
        reservationById.put(id, model);

        return toDto(model);
    }

    public LibraryReservationResponse cancel(String studentNo, Long reservationId) {
        ReservationModel model = reservationById.get(reservationId);
        if (model == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation not found.");
        }
        if (!model.studentNo().equals(studentNo)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your reservation.");
        }

        ReservationModel updated = new ReservationModel(model.id(), model.slotId(), model.studentNo(), model.createdAt(), "CANCELLED", model.date(), model.start(), model.end());
        reservationById.put(reservationId, updated);
        return toDto(updated);
    }

    public LibraryReservationResponse confirm(String studentNo, Long reservationId) {
        ReservationModel model = reservationById.get(reservationId);
        if (model == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation not found.");
        }
        if (!model.studentNo().equals(studentNo)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your reservation.");
        }
        if ("CANCELLED".equals(model.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation cancelled.");
        }

        ReservationModel updated = new ReservationModel(model.id(), model.slotId(), model.studentNo(), model.createdAt(), "CONFIRMED", model.date(), model.start(), model.end());
        reservationById.put(reservationId, updated);
        return toDto(updated);
    }

    private LibraryReservationResponse toDto(ReservationModel model) {
        DateTimeFormatter tFmt = DateTimeFormatter.ofPattern("HH:mm");
        LibraryReservationResponse dto = new LibraryReservationResponse();
        dto.setId(model.id());
        dto.setSlotId(model.slotId());
        dto.setStartTime(model.start().format(tFmt));
        dto.setEndTime(model.end().format(tFmt));
        dto.setReservationDate(model.date().toString());
        dto.setStatus(model.status());
        dto.setCreatedAt(model.createdAt());
        return dto;
    }
}
