package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class WeatherDetailResponse {
    private WeatherCurrentDetailResponse current;
    private List<WeatherHourlyResponse> hourly;
    private List<WeatherDailyResponse> daily;
}

