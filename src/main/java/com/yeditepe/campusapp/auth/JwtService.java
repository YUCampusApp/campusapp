package com.yeditepe.campusapp.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${campusapp.jwt.secret}") String secret,
            @Value("${campusapp.jwt.expiration-days:7}") long expirationDays
    ) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("campusapp.jwt.secret must be at least 32 bytes (UTF-8).");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationMs = expirationDays * 24 * 60 * 60 * 1000L;
    }

    public String createToken(String studentNo) {
        Date now = new Date();
        return Jwts.builder()
                .subject(studentNo)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String parseStudentNo(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
}
