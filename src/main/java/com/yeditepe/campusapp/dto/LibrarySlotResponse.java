package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class LibrarySlotResponse {
    private Long slotId;
    private String startTime;
    private String endTime;
    private int emptySeats;
    private double occupancyRate;
}

