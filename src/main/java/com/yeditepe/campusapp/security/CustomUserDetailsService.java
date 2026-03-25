package com.yeditepe.campusapp.security;

import com.yeditepe.campusapp.entity.Student;
import com.yeditepe.campusapp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.security.core.userdetails.User;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String studentNo) throws UsernameNotFoundException {
        Student student = studentRepository.findByStudentNo(studentNo);
        if (student == null) {
            throw new UsernameNotFoundException("Student not found: " + studentNo);
        }

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_STUDENT"));

        // Username olarak login’de kullanılan öğrenci numarasını tutuyoruz.
        return User.withUsername(student.getStudentNo())
                .password(student.getPassword())
                .authorities(authorities)
                .build();
    }
}

