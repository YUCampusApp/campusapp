package com.yeditepe.campusapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "library_sections")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "section_type", discriminatorType = DiscriminatorType.STRING, length = 32)
@Getter
@Setter
public abstract class LibrarySection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_seats", nullable = false)
    private int totalSeats;
}
