package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.BuildingResponse;
import com.yeditepe.campusapp.service.MockCampusMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campus")
@RequiredArgsConstructor
public class CampusMapController {

    private final MockCampusMapService mockCampusMapService;

    @GetMapping("/buildings")
    public List<BuildingResponse> buildings() {
        return mockCampusMapService.getBuildings();
    }

    @GetMapping("/classrooms")
    public List<String> classrooms(@RequestParam("buildingCode") String buildingCode) {
        return mockCampusMapService.getClassrooms(buildingCode);
    }
}

