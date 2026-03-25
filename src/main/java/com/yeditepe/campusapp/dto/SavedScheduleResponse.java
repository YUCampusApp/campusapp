package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class SavedScheduleResponse {
    private Long id;
    private String name;
    private List<ScheduleSessionResponse> sessions;
}

