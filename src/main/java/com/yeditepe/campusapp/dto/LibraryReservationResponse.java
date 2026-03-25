package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class LibraryReservationResponse {
    private Long id;
    private Long slotId;
    private String startTime;
    private String endTime;
    /** ISO local date (yyyy-MM-dd) of the reserved slot */
    private String reservationDate;
    private String status; // BOOKED/CANCELLED/CONFIRMED
    private Instant createdAt;
}

