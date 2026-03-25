package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.auth.CaptchaStore;
import com.yeditepe.campusapp.auth.JwtService;
import com.yeditepe.campusapp.dto.AuthCaptchaResponse;
import com.yeditepe.campusapp.dto.AuthLoginRequest;
import com.yeditepe.campusapp.dto.AuthLoginResponse;
import com.yeditepe.campusapp.entity.Student;
import com.yeditepe.campusapp.repository.StudentRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import com.yeditepe.campusapp.dto.ChangePasswordRequest;
import com.yeditepe.campusapp.dto.StudentRegisterRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final StudentRepository studentRepository;
    private final CaptchaStore captchaStore;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/captcha")
    public AuthCaptchaResponse captcha() {
        String captchaId = UUID.randomUUID().toString();
        // MVP amacıyla kodu direkt döndürüyoruz. Gerçek uygulamada bunu görsel (image/svg) olarak üretmek gerekir.
        String captchaCode = String.valueOf((int) (Math.random() * 9000) + 1000);
        captchaStore.store(captchaId, captchaCode);
        return new AuthCaptchaResponse(captchaId, captchaCode);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponse> login(@RequestBody AuthLoginRequest request, HttpServletRequest httpRequest) {
        // Geçici olarak (MVP) Captcha doğrulamasını atlıyoruz. Frontend basit bir checkbox kullanıyor.
        // if (!captchaStore.consume(request.getCaptchaId(), request.getCaptchaCode())) {
        //     throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired CAPTCHA.");
        // }

        HttpSession session = httpRequest.getSession(true);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getStudentNo(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Explicitly persist the security context into the session so that subsequent API calls see the user.
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());

        Student student = studentRepository.findByStudentNo(request.getStudentNo());
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found.");
        }

        AuthLoginResponse response = new AuthLoginResponse();
        response.setId(student.getId());
        response.setName(student.getName());
        response.setEmail(student.getEmail());
        response.setStudentNo(student.getStudentNo());
        response.setDepartment(student.getDepartment());
        response.setClassYear(student.getClassYear());
        response.setAccessToken(jwtService.createToken(student.getStudentNo()));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public AuthLoginResponse me() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated.");
        }

        String studentNo = userDetails.getUsername();
        Student student = studentRepository.findByStudentNo(studentNo);
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found.");
        }

        AuthLoginResponse response = new AuthLoginResponse();
        response.setId(student.getId());
        response.setName(student.getName());
        response.setEmail(student.getEmail());
        response.setStudentNo(student.getStudentNo());
        response.setDepartment(student.getDepartment());
        response.setClassYear(student.getClassYear());

        return response;
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated.");
        }
        String studentNo = userDetails.getUsername();
        Student student = studentRepository.findByStudentNo(studentNo);
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters.");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), student.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
        }
        student.setPassword(passwordEncoder.encode(request.getNewPassword()));
        studentRepository.save(student);
        return ResponseEntity.ok().build();
    }
}

