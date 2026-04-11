package com.yeditepe.campusapp.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Login isteği geldiğinde ve yanıt döndüğünde (403 dahil) tek satır log — isteğin filtreye girip çıktığını görün.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class LoginRequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(LoginRequestLoggingFilter.class);

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String m = request.getMethod();
        if (!path.contains("/api/auth/login")) {
            return true;
        }
        return !("POST".equalsIgnoreCase(m) || "OPTIONS".equalsIgnoreCase(m));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        // Logback seviyesinden bağımsız: isteğin bu JVM’e geldiğini doğrulamak için
        System.err.println("[CAMPUS-LOGIN-TRACE] " + method + " " + uri);
        log.info(
                "[LOGIN IN ] {} {} | Origin={} | Referer={} | Content-Type={} | Remote={}",
                method,
                uri,
                request.getHeader("Origin"),
                request.getHeader("Referer"),
                request.getHeader("Content-Type"),
                request.getRemoteAddr()
        );
        filterChain.doFilter(request, response);
        int status = response.getStatus();
        System.err.println("[CAMPUS-LOGIN-TRACE] -> HTTP " + status + " " + method + " " + uri);
        if (status >= 400) {
            log.warn("[LOGIN OUT] {} {} -> HTTP {}", method, uri, status);
        } else {
            log.info("[LOGIN OUT] {} {} -> HTTP {}", method, uri, status);
        }
    }
}
