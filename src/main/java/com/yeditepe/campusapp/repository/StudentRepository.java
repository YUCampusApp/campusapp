package com.yeditepe.campusapp.repository;

import com.yeditepe.campusapp.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Spring Data JPA sihirlerinden biri: İsimlendirme kurallarına uyarsan
    // SQL yazmana gerek kalmaz. Mesela öğrenci numarasına göre öğrenci bulmak için:
    Student findByStudentNo(String studentNo);

    // E-posta ile öğrenci bulmak için:
    Student findByEmail(String email);
}