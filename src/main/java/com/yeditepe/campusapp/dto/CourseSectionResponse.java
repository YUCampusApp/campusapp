package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class CourseSectionResponse {
    private Long id;
    private String day;
    private String startTime;
    private String endTime;
    private String classroom;
    private String instructor;
}

