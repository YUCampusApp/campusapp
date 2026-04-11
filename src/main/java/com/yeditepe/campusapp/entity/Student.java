package com.yeditepe.campusapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "students")
@Data
@EqualsAndHashCode(callSuper = true)
public class Student extends User {

    @Column(name = "student_no", nullable = false, unique = true)
    private String studentNo;

    @Column(name = "department")
    private String department;

    @Column(name = "class_year")
    private Integer classYear;
}