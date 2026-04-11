package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.auth.CaptchaStore;
import com.yeditepe.campusapp.auth.JwtService;
import com.yeditepe.campusapp.dto.AuthCaptchaResponse;
import com.yeditepe.campusapp.dto.AuthLoginRequest;
import com.yeditepe.campusapp.dto.AuthLoginResponse;
import com.yeditepe.campusapp.entity.Admin;
import com.yeditepe.campusapp.entity.Instructor;
import com.yeditepe.campusapp.entity.Student;
import com.yeditepe.campusapp.entity.User;
import com.yeditepe.campusapp.repository.StudentRepository;
import com.yeditepe.campusapp.repository.UserRepository;
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
    private final UserRepository userRepository;
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

        UserDetails ud = (UserDetails) authentication.getPrincipal();
        String principal = ud.getUsername();
        User account = resolveAccount(principal);

        AuthLoginResponse response = toAuthLoginResponse(account);
        response.setAccessToken(jwtService.createToken(principal));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public AuthLoginResponse me() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated.");
        }

        String username = userDetails.getUsername();
        User account = resolveAccount(username);

        return toAuthLoginResponse(account);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated.");
        }
        String username = userDetails.getUsername();
        User account = resolveAccount(username);
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters.");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), account.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
        }
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(account);
        return ResponseEntity.ok().build();
    }

    private User resolveAccount(String principal) {
        Student byNo = studentRepository.findByStudentNo(principal);
        if (byNo != null) {
            return byNo;
        }
        Student byEmail = studentRepository.findByEmail(principal);
        if (byEmail != null) {
            return byEmail;
        }
        return userRepository.findByEmail(principal)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));
    }

    private static AuthLoginResponse toAuthLoginResponse(User user) {
        AuthLoginResponse response = new AuthLoginResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        if (user instanceof Student s) {
            response.setStudentNo(s.getStudentNo());
            response.setDepartment(s.getDepartment());
            response.setClassYear(s.getClassYear());
        } else if (user instanceof Admin a) {
            response.setStudentNo(a.getEmail());
            response.setDepartment(a.getServiceRole() != null ? a.getServiceRole().name() : "");
            response.setClassYear(null);
        } else if (user instanceof Instructor i) {
            response.setStudentNo(i.getInstructorNo());
            response.setDepartment(i.getDepartment());
            response.setClassYear(null);
        } else {
            response.setStudentNo(user.getEmail());
            response.setDepartment("");
            response.setClassYear(null);
        }
        return response;
    }
}

