package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.FavoriteModuleResponse;
import com.yeditepe.campusapp.service.MockCampusDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoritesController {

    private final MockCampusDataService mockCampusDataService;

    private String currentStudentNo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) throw new IllegalStateException("Not authenticated.");
        return userDetails.getUsername();
    }

    @GetMapping("/me")
    public List<FavoriteModuleResponse> me() {
        Set<String> keys = mockCampusDataService.getFavoriteKeys(currentStudentNo());
        List<FavoriteModuleResponse> out = new ArrayList<>();
        for (String key : keys) {
            FavoriteModuleResponse fr = new FavoriteModuleResponse();
            fr.setModuleKey(key);
            fr.setLabel(switch (key) {
                case "WEATHER" -> "Weather";
                case "LIBRARY" -> "Library Reservation";
                case "NOTES" -> "Lecture Notes";
                case "SHUTTLE" -> "Shuttle Tracking";
                case "CAMPUS_MAP" -> "Campus Map";
                default -> key;
            });
            out.add(fr);
        }
        return out;
    }

    @PutMapping("/me")
    public void update(@RequestBody List<String> moduleKeys) {
        mockCampusDataService.setFavorites(currentStudentNo(), Set.copyOf(moduleKeys));
    }
}

