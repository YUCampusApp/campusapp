package com.yeditepe.campusapp.repository;

import com.yeditepe.campusapp.entity.LibraryComp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LibraryCompRepository extends JpaRepository<LibraryComp, Long> {
    Optional<LibraryComp> findFirstByOrderByIdAsc();
}
