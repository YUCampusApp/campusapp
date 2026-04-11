package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.dto.StudentRegisterRequest;
import com.yeditepe.campusapp.dto.StudentResponse;
import com.yeditepe.campusapp.entity.Student;
import com.yeditepe.campusapp.entity.UserRole;
import com.yeditepe.campusapp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    // Artık parametre olarak DTO (Request) alıp, DTO (Response) dönüyoruz
    public StudentResponse registerStudent(StudentRegisterRequest request) {

        // 1. KURAL: Bu email var mı?
        if (studentRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Bu email adresi sistemde zaten kayıtlı!");
        }

        // 2. KURAL: Bu öğrenci numarası var mı?
        if (studentRepository.findByStudentNo(request.getStudentNo()) != null) {
            throw new RuntimeException("Bu öğrenci numarası sistemde zaten kayıtlı!");
        }

        // 3. ÇEVİRİ İŞLEMİ (Request DTO'yu -> Veritabanı Entity'sine çevir)
        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setStudentNo(request.getStudentNo());
        student.setDepartment(request.getDepartment());
        student.setClassYear(request.getClassYear());
        student.setRole(UserRole.student);

        // 4. Veritabanına kaydet
        Student savedStudent = studentRepository.save(student);

        // 5. GÜVENLİ ÇEVİRİ İŞLEMİ (Entity'yi -> Response DTO'ya çevir - ŞİFREYİ GİZLE)
        StudentResponse response = new StudentResponse();
        response.setId(savedStudent.getId());
        response.setName(savedStudent.getName());
        response.setEmail(savedStudent.getEmail());
        response.setStudentNo(savedStudent.getStudentNo());
        response.setDepartment(savedStudent.getDepartment());
        response.setClassYear(savedStudent.getClassYear());

        return response; // Güvenli vitrinimizi geri döndür
    }
}