package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.HairdresserAppointmentResponse;
import com.yeditepe.campusapp.service.HairdresserAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hairdresser")
@RequiredArgsConstructor
public class HairdresserController {
    private final HairdresserAppointmentService hairdresserAppointmentService;

    private String currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new IllegalStateException("Not authenticated.");
        }
        return userDetails.getUsername();
    }

    @GetMapping("/appointments/active")
    public List<HairdresserAppointmentResponse> activeAppointments() {
        return hairdresserAppointmentService.listActiveForHairdresserAdmin(currentPrincipal());
    }

    @DeleteMapping("/appointments/{appointmentId}/admin")
    public HairdresserAppointmentResponse cancelAsAdmin(@PathVariable Long appointmentId) {
        return hairdresserAppointmentService.cancelAsHairdresserAdmin(currentPrincipal(), appointmentId);
    }
}
