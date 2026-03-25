package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class BuildingResponse {
    private String buildingCode; // e.g., A
    private String name;
    private List<String> classroomCodes;
}

