package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.DashboardResponse;
import com.yeditepe.campusapp.service.MockCampusDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final MockCampusDataService mockCampusDataService;

    @GetMapping("/me")
    public DashboardResponse me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            // This should not happen because Spring Security protects this endpoint
            throw new IllegalStateException("Not authenticated.");
        }

        return mockCampusDataService.getDashboard(userDetails.getUsername());
    }
}

