package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class StudentResponse {
    // Dış dünyaya (Mobil uygulamaya) geri döneceğimiz veriler
    private Long id;
    private String name;
    private String email;
    private String studentNo;
    private String department;
    private Integer classYear;
}