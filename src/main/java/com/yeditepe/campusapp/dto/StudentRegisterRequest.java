package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class StudentRegisterRequest {
    // Mobil uygulamadan bize gelecek ham veriler
    private String name;
    private String email;
    private String password;
    private String studentNo;
    private String department;
    private Integer classYear;
}