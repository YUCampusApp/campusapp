package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class WeatherSummaryResponse {
    private int temperatureC;
    private String condition;
}

