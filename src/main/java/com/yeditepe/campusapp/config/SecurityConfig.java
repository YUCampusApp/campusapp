package com.yeditepe.campusapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;

import com.yeditepe.campusapp.auth.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. Şifreleme Motorumuz (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // 2. Kapıdaki Güvenlik Görevlimizin Kuralları
    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            SecurityProblemHandlers securityProblemHandlers
    ) throws Exception {
        http
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(securityProblemHandlers.authenticationEntryPoint())
                        .accessDeniedHandler(securityProblemHandlers.accessDeniedHandler())
                )
                .csrf(csrf -> csrf.disable()) // Şimdilik karmaşık web güvenliklerini kapatıyoruz (Mobil API için genelde kapalı olur)
                .cors(Customizer.withDefaults())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Preflight
                        .requestMatchers("/api/students/register").permitAll() // Kayıt olma kapısı HERKESE AÇIK
                        .requestMatchers(HttpMethod.POST, "/api/auth/change-password").authenticated()
                        .requestMatchers("/api/auth/**").permitAll() // Login/captcha için açık kapı
                        .anyRequest().authenticated() // Bunun dışındaki tüm kapılar KİLİTLİ (Giriş yapmayan giremez)
                );

        http.logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.OK))
                .permitAll()
        );

        return http.build();
    }
}