package com.yeditepe.campusapp.dto;

import lombok.Data;

@Data
public class AuthLoginRequest {
    private String studentNo;
    private String password;

    // CAPTCHA doğrulama alanları
    private String captchaId;
    private String captchaCode;
}

