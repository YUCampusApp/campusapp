package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class WeatherDailyResponse {
    private String dayLabel;
    private String condition;
    private int highC;
    private int lowC;
}
