package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class AuthLoginResponse {
    private Long id;
    private String name;
    private String email;
    private String studentNo;
    private String department;
    private Integer classYear;
    /** JWT for native/Capacitor clients where session cookies are unreliable. Web can ignore this field. */
    private String accessToken;
}

