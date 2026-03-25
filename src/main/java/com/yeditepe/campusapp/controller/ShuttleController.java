package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.ShuttleEtaResponse;
import com.yeditepe.campusapp.dto.ShuttleStopResponse;
import com.yeditepe.campusapp.service.MockShuttleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shuttles")
@RequiredArgsConstructor
public class ShuttleController {

    private final MockShuttleService mockShuttleService;

    @GetMapping("/stops")
    public List<ShuttleStopResponse> stops() {
        return mockShuttleService.getStops();
    }

    @GetMapping("/track")
    public List<ShuttleEtaResponse> track(@RequestParam("stopId") Long stopId) {
        return mockShuttleService.track(stopId);
    }
}

