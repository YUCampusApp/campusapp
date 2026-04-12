package com.yeditepe.campusapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LibraryReservationCompletionScheduler {

    private final LibraryReservationMaintenance reservationMaintenance;

    @Scheduled(fixedDelay = 60_000)
    public void completeEndedReservations() {
        reservationMaintenance.sweepCompletedReservations();
    }
}
