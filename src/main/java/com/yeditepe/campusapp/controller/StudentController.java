package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.StudentRegisterRequest;
import com.yeditepe.campusapp.dto.StudentResponse;
import com.yeditepe.campusapp.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping("/register")
    public ResponseEntity<StudentResponse> registerStudent(@RequestBody StudentRegisterRequest request) {

        // Gelen Request'i servise yolla, güvenli Response'u al
        StudentResponse response = studentService.registerStudent(request);

        return ResponseEntity.ok(response);
    }
}