package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class NotificationResponse {
    private Long id;
    private String type;
    private String message;
    private Instant createdAt;
    private boolean read;
}

