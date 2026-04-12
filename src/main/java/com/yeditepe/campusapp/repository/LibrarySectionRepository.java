package com.yeditepe.campusapp.repository;

import com.yeditepe.campusapp.entity.LibrarySection;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LibrarySectionRepository extends JpaRepository<LibrarySection, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM LibrarySection s WHERE s.id = :id")
    Optional<LibrarySection> findByIdForUpdate(@Param("id") Long id);
}
