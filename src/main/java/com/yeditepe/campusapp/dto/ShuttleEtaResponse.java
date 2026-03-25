package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class ShuttleEtaResponse {
    private Long stopId;
    private String busName;
    private int etaMinutes;
}

