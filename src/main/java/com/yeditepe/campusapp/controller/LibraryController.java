package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.CreateLibraryReservationRequest;
import com.yeditepe.campusapp.dto.LibraryPolicyStatusResponse;
import com.yeditepe.campusapp.dto.LibraryReservationResponse;
import com.yeditepe.campusapp.dto.LibrarySlotResponse;
import com.yeditepe.campusapp.service.MockLibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final MockLibraryService mockLibraryService;

    private String currentStudentNo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) throw new IllegalStateException("Not authenticated.");
        return userDetails.getUsername();
    }

    @GetMapping("/policy-status")
    public LibraryPolicyStatusResponse policyStatus() {
        return mockLibraryService.policyStatusForStudent(currentStudentNo());
    }

    @GetMapping("/reservations/me")
    public List<LibraryReservationResponse> myReservations() {
        return mockLibraryService.listMyReservations(currentStudentNo());
    }

    @GetMapping("/slots")
    public List<LibrarySlotResponse> slots(@RequestParam(name = "date", required = false) String date) {
        LocalDate d = date == null ? LocalDate.now() : LocalDate.parse(date);
        return mockLibraryService.getSlots(d);
    }

    @PostMapping("/reservations")
    public LibraryReservationResponse reserve(@RequestBody CreateLibraryReservationRequest request) {
        return mockLibraryService.reserve(currentStudentNo(), request);
    }

    @DeleteMapping("/reservations/{reservationId}")
    public LibraryReservationResponse cancel(@PathVariable Long reservationId) {
        return mockLibraryService.cancel(currentStudentNo(), reservationId);
    }

    @PostMapping("/reservations/{reservationId}/confirm")
    public LibraryReservationResponse confirm(@PathVariable Long reservationId) {
        return mockLibraryService.confirm(currentStudentNo(), reservationId);
    }
}

