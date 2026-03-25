package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.WeatherDetailResponse;
import com.yeditepe.campusapp.service.MockCampusDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final MockCampusDataService mockCampusDataService;

    @GetMapping("/me")
    public WeatherDetailResponse me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new IllegalStateException("Not authenticated.");
        }
        return mockCampusDataService.getWeatherDetail();
    }
}

