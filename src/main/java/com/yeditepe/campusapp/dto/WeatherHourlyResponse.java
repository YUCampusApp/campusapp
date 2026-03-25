package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class WeatherHourlyResponse {
    private String time;
    private int temperatureC;
    private String condition;
}

