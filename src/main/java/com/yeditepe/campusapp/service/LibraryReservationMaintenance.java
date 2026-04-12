package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.entity.LibraryReservationStatus;
import com.yeditepe.campusapp.repository.LibraryReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class LibraryReservationMaintenance {

    private final LibraryReservationRepository reservationRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sweepCompletedReservations() {
        reservationRepository.markEndedAsCompleted(
                Instant.now(),
                LibraryReservationStatus.ACTIVE,
                LibraryReservationStatus.COMPLETED
        );
    }
}
