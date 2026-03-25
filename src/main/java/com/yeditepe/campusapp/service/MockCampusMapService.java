package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.dto.BuildingResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class MockCampusMapService {

    private final List<BuildingResponse> buildings;

    public MockCampusMapService() {
        buildings = new ArrayList<>();

        BuildingResponse a = new BuildingResponse();
        a.setBuildingCode("A");
        a.setName("Engineering Faculty");
        a.setClassroomCodes(List.of("A-101", "A-105", "A-201"));
        buildings.add(a);

        BuildingResponse b = new BuildingResponse();
        b.setBuildingCode("B");
        b.setName("Science Building");
        b.setClassroomCodes(List.of("B-101", "B-105", "B-305"));
        buildings.add(b);

        BuildingResponse c = new BuildingResponse();
        c.setBuildingCode("C");
        c.setName("Math & Computing Center");
        c.setClassroomCodes(List.of("C-115", "C-210"));
        buildings.add(c);
    }

    public List<BuildingResponse> getBuildings() {
        return buildings;
    }

    public List<String> getClassrooms(String buildingCode) {
        if (buildingCode == null) return List.of();
        for (BuildingResponse b : buildings) {
            if (buildingCode.equalsIgnoreCase(b.getBuildingCode())) {
                return b.getClassroomCodes();
            }
        }
        return List.of();
    }
}

