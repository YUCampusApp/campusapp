package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class AcademicClassResponse {
    private String day; // MONDAY etc
    private String startTime; // HH:mm
    private String endTime; // HH:mm
    private String courseName;
    private String classroom;
    private String instructor;
}

