package com.yeditepe.campusapp.repository;

import com.yeditepe.campusapp.entity.LibraryReservation;
import com.yeditepe.campusapp.entity.LibraryReservationStatus;
import com.yeditepe.campusapp.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface LibraryReservationRepository extends JpaRepository<LibraryReservation, Long> {

    @Query("""
            SELECT COUNT(r) FROM LibraryReservation r
            WHERE r.section.id = :sectionId
              AND r.status = :active
              AND r.startAt < :end
              AND r.endAt > :start
            """)
    long countActiveOverlapping(
            @Param("sectionId") Long sectionId,
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("active") LibraryReservationStatus active
    );

    @Query("""
            SELECT COUNT(r) FROM LibraryReservation r
            WHERE r.student.id = :studentId
              AND r.status = :active
              AND r.endAt > :now
            """)
    long countActiveFutureOrOngoing(
            @Param("studentId") Long studentId,
            @Param("now") Instant now,
            @Param("active") LibraryReservationStatus active
    );

    List<LibraryReservation> findByStudentOrderByStartAtDesc(Student student);

    List<LibraryReservation> findByStudentAndStatusInOrderByStartAtAsc(Student student, Collection<LibraryReservationStatus> statuses);

    @Query("""
            SELECT COUNT(r) FROM LibraryReservation r
            WHERE r.section.id = :sectionId
              AND r.status = :active
              AND r.startAt <= :t
              AND r.endAt > :t
            """)
    long countActiveAtInstant(
            @Param("sectionId") Long sectionId,
            @Param("t") Instant t,
            @Param("active") LibraryReservationStatus active
    );

    @Modifying
    @Query("UPDATE LibraryReservation r SET r.status = :completed WHERE r.status = :active AND r.endAt <= :now")
    int markEndedAsCompleted(
            @Param("now") Instant now,
            @Param("active") LibraryReservationStatus active,
            @Param("completed") LibraryReservationStatus completed
    );
}
