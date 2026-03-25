package com.yeditepe.campusapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "instructors")
@Data
@EqualsAndHashCode(callSuper = true) // User'daki özellikleri de eşleştirmeye katar
public class Instructor extends User {

    @Column(nullable = false, unique = true)
    private String instructorNo; // Eğitmen sicil veya ID numarası

    private String department; // Hangi bölümde olduğu

    private String title; // Prof. Dr., Doç. Dr. gibi unvanları tutmak için
}