package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardResponse {
    private String welcomeMessage;
    private String currentTime;
    private String currentDate;
    private WeatherSummaryResponse weather;
    private List<AcademicClassResponse> todaysClasses;
    private AcademicClassResponse nextCourse;
    private List<AnnouncementResponse> announcements;
    private List<ReminderResponse> reminders;
    private List<FavoriteModuleResponse> favorites;
}

