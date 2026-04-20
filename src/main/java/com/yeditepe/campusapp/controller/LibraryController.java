package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.CreateLibraryReservationRequest;
import com.yeditepe.campusapp.dto.LibraryPolicyStatusResponse;
import com.yeditepe.campusapp.dto.LibraryReservationResponse;
import com.yeditepe.campusapp.dto.LibrarySectionStatusResponse;
import com.yeditepe.campusapp.service.LibraryReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryReservationService libraryReservationService;

    private String currentStudentNo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new IllegalStateException("Not authenticated.");
        }
        return userDetails.getUsername();
    }

    @GetMapping("/policy-status")
    public LibraryPolicyStatusResponse policyStatus() {
        return new LibraryPolicyStatusResponse(false, null, null);
    }

    @GetMapping("/sections")
    public List<LibrarySectionStatusResponse> sections() {
        return libraryReservationService.sectionStatuses();
    }

    @GetMapping("/reservations/me")
    public List<LibraryReservationResponse> myReservations() {
        return libraryReservationService.listMine(currentStudentNo());
    }

    @PostMapping("/reservations")
    public LibraryReservationResponse reserve(@RequestBody CreateLibraryReservationRequest request) {
        return libraryReservationService.reserve(currentStudentNo(), request);
    }

    @DeleteMapping("/reservations/{reservationId}")
    public LibraryReservationResponse cancel(@PathVariable Long reservationId) {
        return libraryReservationService.cancel(currentStudentNo(), reservationId);
    }

    @GetMapping("/reservations/active")
    public List<LibraryReservationResponse> activeReservationsForLibraryAdmin() {
        return libraryReservationService.listActiveForLibraryAdmin(currentStudentNo());
    }

    @DeleteMapping("/reservations/{reservationId}/admin")
    public LibraryReservationResponse cancelAsLibraryAdmin(@PathVariable Long reservationId) {
        return libraryReservationService.cancelAsLibraryAdmin(currentStudentNo(), reservationId);
    }
}
