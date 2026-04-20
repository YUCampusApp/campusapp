package com.yeditepe.campusapp.repository;

import com.yeditepe.campusapp.entity.HairdresserAppointment;
import com.yeditepe.campusapp.entity.HairdresserAppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface HairdresserAppointmentRepository extends JpaRepository<HairdresserAppointment, Long> {
    List<HairdresserAppointment> findByStatusAndEndAtAfterOrderByStartAtAsc(HairdresserAppointmentStatus status, Instant now);
}
