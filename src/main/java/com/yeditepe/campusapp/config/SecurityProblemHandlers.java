package com.yeditepe.campusapp.config;

import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

/**
 * Filtre zincirinde oluşan 401/403 için terminal logları + JSON gövde.
 * (Controller içindeki hatalar {@link com.yeditepe.campusapp.exception.AuthExceptionControllerAdvice} ile yakalanır.)
 */
@Component
public class SecurityProblemHandlers {

    private static final Logger log = LoggerFactory.getLogger(SecurityProblemHandlers.class);

    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            log.warn(
                    "[SECURITY 401] {} {} | Origin={} | Remote={} | reason={} | type={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    request.getHeader("Origin"),
                    request.getRemoteAddr(),
                    authException.getMessage(),
                    authException.getClass().getSimpleName()
            );
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHORIZED",
                    authException.getMessage() != null ? authException.getMessage() : "Unauthorized");
        };
    }

    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String name = auth != null ? auth.getName() : "null";
            boolean authenticated = auth != null && auth.isAuthenticated();
            log.error(
                    "[SECURITY 403] {} {} | Origin={} | Remote={} | principal={} | isAuthenticated={} | reason={} | type={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    request.getHeader("Origin"),
                    request.getRemoteAddr(),
                    name,
                    authenticated,
                    accessDeniedException.getMessage(),
                    accessDeniedException.getClass().getSimpleName(),
                    accessDeniedException
            );
            writeJson(response, HttpServletResponse.SC_FORBIDDEN, "FORBIDDEN",
                    accessDeniedException.getMessage() != null ? accessDeniedException.getMessage() : "Access denied");
        };
    }

    private static void writeJson(HttpServletResponse response, int status, String code, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String msg = message == null ? "" : message.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
        response.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"" + msg + "\"}");
    }
}
