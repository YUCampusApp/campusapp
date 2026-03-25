package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class ScheduleSessionResponse {
    private String day;
    private String startTime;
    private String endTime;
    private String courseName;
    private String classroom;
    private String instructor;
}

