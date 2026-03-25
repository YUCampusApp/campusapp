package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class GenerateScheduleRequest {
    private List<Long> selectedCourseIds;
    private Integer maxAlternatives; // optional
}

