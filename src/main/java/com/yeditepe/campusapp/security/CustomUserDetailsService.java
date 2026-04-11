package com.yeditepe.campusapp.security;

import com.yeditepe.campusapp.entity.Admin;
import com.yeditepe.campusapp.entity.Instructor;
import com.yeditepe.campusapp.entity.Student;
import com.yeditepe.campusapp.entity.User;
import com.yeditepe.campusapp.repository.StudentRepository;
import com.yeditepe.campusapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("[USER DETAILS] loadUserByUsername lookup (len={})", username != null ? username.length() : 0);

        Student byNo = studentRepository.findByStudentNo(username);
        if (byNo != null) {
            log.info("[USER DETAILS] hit Student by studentNo id={}", byNo.getId());
            return buildUserDetails(byNo.getPassword(), byNo.getStudentNo(), authoritiesFor(byNo));
        }

        Student byEmail = studentRepository.findByEmail(username);
        if (byEmail != null) {
            log.info("[USER DETAILS] hit Student by email id={}", byEmail.getId());
            return buildUserDetails(byEmail.getPassword(), byEmail.getStudentNo(), authoritiesFor(byEmail));
        }

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> {
                    log.warn("[USER DETAILS] no user for email/studentNo lookup (len={})", username != null ? username.length() : 0);
                    return new UsernameNotFoundException("User not found: " + username);
                });

        log.info("[USER DETAILS] hit UserRepository {} id={}", user.getClass().getSimpleName(), user.getId());
        return buildUserDetails(user.getPassword(), username, authoritiesFor(user));
    }

    private static UserDetails buildUserDetails(String password, String principalName, List<GrantedAuthority> authorities) {
        return org.springframework.security.core.userdetails.User.withUsername(principalName)
                .password(password)
                .authorities(authorities)
                .build();
    }

    private static List<GrantedAuthority> authoritiesFor(User user) {
        if (user instanceof Student) {
            return List.of(new SimpleGrantedAuthority("ROLE_STUDENT"));
        }
        if (user instanceof Admin) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        if (user instanceof Instructor) {
            return List.of(new SimpleGrantedAuthority("ROLE_INSTRUCTOR"));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
