package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class HairdresserAppointmentResponse {
    private Long id;
    private String studentName;
    private String studentNo;
    private String startAt;
    private String endAt;
    private String startLocal;
    private String endLocal;
    private String status;
    private Instant createdAt;
}
