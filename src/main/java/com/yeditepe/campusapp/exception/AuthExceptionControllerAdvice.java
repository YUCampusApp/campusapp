package com.yeditepe.campusapp.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * {@code /api/auth/login} içinde {@code AuthenticationManager#authenticate} fırlattığı
 * {@link AuthenticationException} türlerini yakalar; terminalde sebep görünür.
 */
@RestControllerAdvice
public class AuthExceptionControllerAdvice {

    private static final Logger log = LoggerFactory.getLogger(AuthExceptionControllerAdvice.class);

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> onAuthenticationFailure(AuthenticationException ex) {
        log.warn(
                "[AUTH LOGIN FAILED] type={} message={}",
                ex.getClass().getSimpleName(),
                ex.getMessage()
        );
        log.debug("[AUTH LOGIN FAILED] stack trace", ex);

        Map<String, String> body = new LinkedHashMap<>();
        body.put("code", "BAD_CREDENTIALS");
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Authentication failed");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }
}
