package com.yeditepe.campusapp.repository;

import com.yeditepe.campusapp.entity.LibraryGeneral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LibraryGeneralRepository extends JpaRepository<LibraryGeneral, Long> {
    Optional<LibraryGeneral> findFirstByOrderByIdAsc();
}
