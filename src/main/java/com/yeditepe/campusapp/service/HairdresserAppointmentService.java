package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.dto.HairdresserAppointmentResponse;
import com.yeditepe.campusapp.entity.Admin;
import com.yeditepe.campusapp.entity.AdminServiceRole;
import com.yeditepe.campusapp.entity.HairdresserAppointment;
import com.yeditepe.campusapp.entity.HairdresserAppointmentStatus;
import com.yeditepe.campusapp.entity.Student;
import com.yeditepe.campusapp.entity.User;
import com.yeditepe.campusapp.repository.HairdresserAppointmentRepository;
import com.yeditepe.campusapp.repository.StudentRepository;
import com.yeditepe.campusapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HairdresserAppointmentService {
    private static final ZoneId ISTANBUL = ZoneId.of("Europe/Istanbul");

    private final HairdresserAppointmentRepository appointmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public List<HairdresserAppointmentResponse> listActiveForHairdresserAdmin(String principal) {
        requireHairdresserAdmin(principal);
        return appointmentRepository
                .findByStatusAndEndAtAfterOrderByStartAtAsc(HairdresserAppointmentStatus.ACTIVE, Instant.now())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public HairdresserAppointmentResponse cancelAsHairdresserAdmin(String principal, Long appointmentId) {
        requireHairdresserAdmin(principal);
        HairdresserAppointment ap = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment not found."));
        if (ap.getStatus() == HairdresserAppointmentStatus.CANCELLED) {
            return toDto(ap);
        }
        if (ap.getStatus() == HairdresserAppointmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed appointments cannot be cancelled.");
        }
        ap.setStatus(HairdresserAppointmentStatus.CANCELLED);
        return toDto(appointmentRepository.save(ap));
    }

    private void requireHairdresserAdmin(String principal) {
        User user = resolvePrincipalUser(principal);
        if (!(user instanceof Admin admin) || admin.getServiceRole() != AdminServiceRole.Hairdresser) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only hairdresser admins can access this endpoint.");
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

    private HairdresserAppointmentResponse toDto(HairdresserAppointment ap) {
        HairdresserAppointmentResponse dto = new HairdresserAppointmentResponse();
        dto.setId(ap.getId());
        dto.setStudentName(ap.getStudent().getName());
        dto.setStudentNo(ap.getStudent().getStudentNo());
        dto.setStartAt(ap.getStartAt().toString());
        dto.setEndAt(ap.getEndAt().toString());
        dto.setStartLocal(ap.getStartAt().atZone(ISTANBUL).toLocalDateTime().toString());
        dto.setEndLocal(ap.getEndAt().atZone(ISTANBUL).toLocalDateTime().toString());
        dto.setStatus(ap.getStatus().name());
        dto.setCreatedAt(ap.getCreatedAt());
        return dto;
    }
}
