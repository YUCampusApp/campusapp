package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class WeatherCurrentDetailResponse {
    private int temperatureC;
    private String condition;
    private int feelsLikeC;
    private int humidityPct;
    private int windKmh;
}
