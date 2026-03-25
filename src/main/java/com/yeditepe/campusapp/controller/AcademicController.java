package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.*;
import com.yeditepe.campusapp.service.MockCampusDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic")
@RequiredArgsConstructor
public class AcademicController {

    private final MockCampusDataService mockCampusDataService;

    private String currentStudentNo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new IllegalStateException("Not authenticated.");
        }
        return userDetails.getUsername();
    }

    @GetMapping("/courses")
    public List<CourseResponse> courses() {
        return mockCampusDataService.getCourses();
    }

    @GetMapping("/today")
    public List<AcademicClassResponse> today() {
        return mockCampusDataService.getTodaysClasses();
    }

    public record GpaResponse(double gpa) {}

    @GetMapping("/gpa/me")
    public GpaResponse gpaMe() {
        return new GpaResponse(mockCampusDataService.getMockGpa(currentStudentNo()));
    }

    @PostMapping("/schedule/generate")
    public List<ScheduleAlternativeResponse> generate(@RequestBody GenerateScheduleRequest request) {
        return mockCampusDataService.generateSchedules(request);
    }

    @PostMapping("/schedules/save")
    public SavedScheduleResponse save(@RequestBody SaveScheduleRequest request) {
        return mockCampusDataService.saveSchedule(currentStudentNo(), request);
    }

    @GetMapping("/schedules/me")
    public List<SavedScheduleResponse> savedSchedules() {
        return mockCampusDataService.getSavedSchedules(currentStudentNo());
    }
}

