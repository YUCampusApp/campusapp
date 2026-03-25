package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class ScheduleAlternativeResponse {
    private Long id;
    private String name;
    private List<ScheduleSessionResponse> sessions;
}

