package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.dto.ShuttleEtaResponse;
import com.yeditepe.campusapp.dto.ShuttleStopResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MockShuttleService {

    private final List<ShuttleStopResponse> stops;

    public MockShuttleService() {
        ShuttleStopResponse s1 = new ShuttleStopResponse();
        s1.setId(1L);
        s1.setName("Main Gate");

        ShuttleStopResponse s2 = new ShuttleStopResponse();
        s2.setId(2L);
        s2.setName("Central Campus");

        ShuttleStopResponse s3 = new ShuttleStopResponse();
        s3.setId(3L);
        s3.setName("Faculty Area");

        stops = List.of(s1, s2, s3);
    }

    public List<ShuttleStopResponse> getStops() {
        return stops;
    }

    public List<ShuttleEtaResponse> track(Long stopId) {
        List<ShuttleEtaResponse> out = new ArrayList<>();

        // simple deterministic mock
        int base = stopId == null ? 0 : Math.abs(stopId.hashCode() % 7);
        int[] etas = new int[] {5 + base, 12 + base, 22 + base};

        for (int i = 0; i < etas.length; i++) {
            ShuttleEtaResponse eta = new ShuttleEtaResponse();
            eta.setStopId(stopId);
            eta.setBusName("Shuttle-" + (i + 1));
            eta.setEtaMinutes(etas[i]);
            out.add(eta);
        }
        return out;
    }
}

