package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.NotificationResponse;
import com.yeditepe.campusapp.dto.ReminderResponse;
import com.yeditepe.campusapp.service.MockCampusDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationsController {

    private final MockCampusDataService mockCampusDataService;
    private final ConcurrentHashMap<String, Set<Long>> readByStudent = new ConcurrentHashMap<>();

    private String currentStudentNo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) throw new IllegalStateException("Not authenticated.");
        return userDetails.getUsername();
    }

    @GetMapping("/me")
    public List<NotificationResponse> me() {
        String studentNo = currentStudentNo();
        Set<Long> readIds = readByStudent.getOrDefault(studentNo, Set.of());

        List<ReminderResponse> reminders = mockCampusDataService.getReminders(studentNo);
        List<NotificationResponse> out = new ArrayList<>();
        for (int i = 0; i < reminders.size(); i++) {
            ReminderResponse r = reminders.get(i);
            NotificationResponse n = new NotificationResponse();
            n.setId((long) (i + 1));
            n.setType(r.getType());
            n.setMessage(r.getMessage());
            n.setCreatedAt(Instant.now());
            n.setRead(readIds.contains(n.getId()));
            out.add(n);
        }
        return out;
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable("id") Long id) {
        String studentNo = currentStudentNo();
        readByStudent.compute(studentNo, (k, v) -> {
            Set<Long> set = v == null ? ConcurrentHashMap.newKeySet() : v;
            set.add(id);
            return set;
        });
    }
}

