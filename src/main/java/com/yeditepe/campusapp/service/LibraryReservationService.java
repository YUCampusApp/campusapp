package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.dto.CreateLibraryReservationRequest;
import com.yeditepe.campusapp.dto.LibraryReservationResponse;
import com.yeditepe.campusapp.dto.LibrarySectionStatusResponse;
import com.yeditepe.campusapp.entity.*;
import com.yeditepe.campusapp.repository.LibraryCompRepository;
import com.yeditepe.campusapp.repository.LibraryGeneralRepository;
import com.yeditepe.campusapp.repository.LibraryReservationRepository;
import com.yeditepe.campusapp.repository.LibrarySectionRepository;
import com.yeditepe.campusapp.repository.StudentRepository;
import com.yeditepe.campusapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LibraryReservationService {

    private static final int MIN_MINUTES = 30;
    private static final int MAX_MINUTES = 12 * 60;
    private static final int DAILY_CAP_MINUTES = 12 * 60;

    private final LibraryIstanbulHoursService hoursService;
    private final LibraryReservationRepository reservationRepository;
    private final LibrarySectionRepository sectionRepository;
    private final LibraryCompRepository compRepository;
    private final LibraryGeneralRepository generalRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final LibraryReservationMaintenance reservationMaintenance;

    @Transactional(readOnly = true)
    public List<LibrarySectionStatusResponse> sectionStatuses() {
        sweepCompleted();
        Instant now = Instant.now();
        LibraryComp comp = compRepository.findFirstByOrderByIdAsc().orElseThrow(missingSection());
        LibraryGeneral gen = generalRepository.findFirstByOrderByIdAsc().orElseThrow(missingSection());
        return List.of(
                toSectionStatus(comp, LibrarySectionType.COMP, now),
                toSectionStatus(gen, LibrarySectionType.GENERAL, now)
        );
    }

    private static java.util.function.Supplier<ResponseStatusException> missingSection() {
        return () -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Library sections not initialized.");
    }

    private LibrarySectionStatusResponse toSectionStatus(LibrarySection section, LibrarySectionType type, Instant now) {
        long used = reservationRepository.countActiveAtInstant(section.getId(), now, LibraryReservationStatus.ACTIVE);
        int total = section.getTotalSeats();
        int available = (int) Math.max(0, total - used);
        LibrarySectionStatusResponse dto = new LibrarySectionStatusResponse();
        dto.setSectionType(type);
        dto.setTotalSeats(total);
        dto.setAvailableSeats(available);
        dto.setFull(available <= 0);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<LibraryReservationResponse> listMine(String studentNo) {
        sweepCompleted();
        Student student = requireStudent(studentNo);
        return reservationRepository.findByStudentOrderByStartAtDesc(student).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LibraryReservationResponse> listActiveForLibraryAdmin(String principal) {
        sweepCompleted();
        requireLibraryAdmin(principal);
        return reservationRepository
                .findByStatusAndEndAtAfterOrderByStartAtAsc(LibraryReservationStatus.ACTIVE, Instant.now())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public LibraryReservationResponse reserve(String studentNo, CreateLibraryReservationRequest request) {
        sweepCompleted();
        Student student = requireStudent(studentNo);
        LibrarySection section = resolveSection(request.getSectionType());
        section = sectionRepository.findByIdForUpdate(section.getId()).orElseThrow(missingSection());

        if (request.getStartLocal() == null || request.getEndLocal() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startLocal and endLocal are required.");
        }

        ZoneId ist = LibraryIstanbulHoursService.ISTANBUL;
        Instant start = request.getStartLocal().atZone(ist).toInstant();
        Instant end = request.getEndLocal().atZone(ist).toInstant();

        validateTimingAndHours(start, end);
        validateSingleActive(student);
        validateDailyQuota(student, null, start, end);
        validateCapacity(section, start, end);

        LibraryReservation r = new LibraryReservation();
        r.setStudent(student);
        r.setSection(section);
        r.setStartAt(start);
        r.setEndAt(end);
        r.setStatus(LibraryReservationStatus.ACTIVE);
        r.setCreatedAt(Instant.now());
        r = reservationRepository.save(r);
        return toDto(r);
    }

    private void sweepCompleted() {
        reservationMaintenance.sweepCompletedReservations();
    }

    private void validateTimingAndHours(Instant start, Instant end) {
        if (!end.isAfter(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }
        long minutes = ChronoUnit.MINUTES.between(start, end);
        if (minutes < MIN_MINUTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservations must be at least 30 minutes.");
        }
        if (minutes > MAX_MINUTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A single reservation cannot exceed 12 hours.");
        }

        Instant now = Instant.now();
        Instant minStart = now.atZone(LibraryIstanbulHoursService.ISTANBUL)
                .truncatedTo(ChronoUnit.MINUTES)
                .toInstant();
        if (start.isBefore(minStart)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot book a time in the past.");
        }

        if (!hoursService.isIntervalFullyWithinOpenHours(start, end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservations cannot include hours when the library is closed.");
        }
    }

    private void validateSingleActive(Student student) {
        long n = reservationRepository.countActiveFutureOrOngoing(student.getId(), Instant.now(), LibraryReservationStatus.ACTIVE);
        if (n > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can only have one active reservation at a time.");
        }
    }

    private void validateDailyQuota(Student student, Long excludeReservationId, Instant start, Instant end) {
        Map<LocalDate, Long> newContribution = minutesPerIstanbulDay(start, end);
        List<LibraryReservation> others = reservationRepository.findByStudentAndStatusInOrderByStartAtAsc(
                student,
                EnumSet.of(LibraryReservationStatus.ACTIVE, LibraryReservationStatus.COMPLETED)
        );
        Map<LocalDate, Long> dayTotals = new HashMap<>();
        for (LibraryReservation r : others) {
            if (excludeReservationId != null && excludeReservationId.equals(r.getId())) {
                continue;
            }
            mergeMinutes(dayTotals, minutesPerIstanbulDay(r.getStartAt(), r.getEndAt()));
        }
        for (Map.Entry<LocalDate, Long> e : newContribution.entrySet()) {
            long sum = dayTotals.getOrDefault(e.getKey(), 0L) + e.getValue();
            if (sum > DAILY_CAP_MINUTES) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Daily limit is 12 hours of reservations (" + e.getKey() + ")."
                );
            }
        }
    }

    /** [start,end) aralığının her dakikasını İstanbul yerel tarihine göre gruplar. */
    private static Map<LocalDate, Long> minutesPerIstanbulDay(Instant start, Instant end) {
        Map<LocalDate, Long> map = new HashMap<>();
        Instant cur = start;
        ZoneId ist = LibraryIstanbulHoursService.ISTANBUL;
        while (cur.isBefore(end)) {
            LocalDate d = cur.atZone(ist).toLocalDate();
            map.merge(d, 1L, Long::sum);
            cur = cur.plus(1, ChronoUnit.MINUTES);
        }
        return map;
    }

    private static void mergeMinutes(Map<LocalDate, Long> acc, Map<LocalDate, Long> add) {
        for (Map.Entry<LocalDate, Long> e : add.entrySet()) {
            acc.merge(e.getKey(), e.getValue(), Long::sum);
        }
    }

    private void validateCapacity(LibrarySection section, Instant start, Instant end) {
        long overlapping = reservationRepository.countActiveOverlapping(
                section.getId(),
                start,
                end,
                LibraryReservationStatus.ACTIVE
        );
        if (overlapping >= section.getTotalSeats()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No seats left for the selected time range.");
        }
    }

    @Transactional
    public LibraryReservationResponse cancel(String studentNo, Long reservationId) {
        sweepCompleted();
        LibraryReservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation not found."));
        Student student = requireStudent(studentNo);
        if (!r.getStudent().getId().equals(student.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This reservation does not belong to you.");
        }
        if (r.getStatus() == LibraryReservationStatus.CANCELLED) {
            return toDto(r);
        }
        if (r.getStatus() == LibraryReservationStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed reservations cannot be cancelled.");
        }
        r.setStatus(LibraryReservationStatus.CANCELLED);
        return toDto(reservationRepository.save(r));
    }

    @Transactional
    public LibraryReservationResponse cancelAsLibraryAdmin(String principal, Long reservationId) {
        sweepCompleted();
        requireLibraryAdmin(principal);
        LibraryReservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation not found."));
        if (r.getStatus() == LibraryReservationStatus.CANCELLED) {
            return toDto(r);
        }
        if (r.getStatus() == LibraryReservationStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed reservations cannot be cancelled.");
        }
        r.setStatus(LibraryReservationStatus.CANCELLED);
        return toDto(reservationRepository.save(r));
    }

    private Student requireStudent(String studentNo) {
        Student s = studentRepository.findByStudentNo(studentNo);
        if (s == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can manage library reservations.");
        }
        return s;
    }

    private void requireLibraryAdmin(String principal) {
        User user = resolvePrincipalUser(principal);
        if (!(user instanceof Admin admin) || admin.getServiceRole() != AdminServiceRole.Library) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only library admins can access this endpoint.");
        }
    }

    private User resolvePrincipalUser(String principal) {
        Student byNo = studentRepository.findByStudentNo(principal);
        if (byNo != null) return byNo;
        Student byEmail = studentRepository.findByEmail(principal);
        if (byEmail != null) return byEmail;
        return userRepository.findByEmail(principal)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));
    }

    private LibrarySection resolveSection(LibrarySectionType type) {
        if (type == LibrarySectionType.COMP) {
            return compRepository.findFirstByOrderByIdAsc().orElseThrow(missingSection());
        }
        if (type == LibrarySectionType.GENERAL) {
            return generalRepository.findFirstByOrderByIdAsc().orElseThrow(missingSection());
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid section.");
    }

    private LibraryReservationResponse toDto(LibraryReservation r) {
        ZoneId ist = LibraryIstanbulHoursService.ISTANBUL;
        ZonedDateTime zs = r.getStartAt().atZone(ist);
        LibraryReservationResponse dto = new LibraryReservationResponse();
        dto.setId(r.getId());
        dto.setStudentName(r.getStudent().getName());
        dto.setStudentNo(r.getStudent().getStudentNo());
        dto.setSectionType(sectionTypeOf(r.getSection()));
        dto.setStartAt(r.getStartAt().toString());
        dto.setEndAt(r.getEndAt().toString());
        dto.setStartLocal(r.getStartAt().atZone(ist).toLocalDateTime().toString());
        dto.setEndLocal(r.getEndAt().atZone(ist).toLocalDateTime().toString());
        dto.setReservationDate(zs.toLocalDate().toString());
        dto.setStatus(r.getStatus().name());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }

    private static LibrarySectionType sectionTypeOf(LibrarySection section) {
        LibrarySection s = (LibrarySection) Hibernate.unproxy(section);
        if (s instanceof LibraryComp) {
            return LibrarySectionType.COMP;
        }
        if (s instanceof LibraryGeneral) {
            return LibrarySectionType.GENERAL;
        }
        throw new IllegalStateException("Unknown section type: " + s.getClass().getName());
    }
}
