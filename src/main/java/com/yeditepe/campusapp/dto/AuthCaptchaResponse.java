package com.yeditepe.campusapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthCaptchaResponse {
    private String captchaId;
    private String captchaCode;
}

