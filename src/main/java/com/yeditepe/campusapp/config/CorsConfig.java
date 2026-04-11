package com.yeditepe.campusapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    private final Environment environment;

    public CorsConfig(Environment environment) {
        this.environment = environment;
    }

    /**
     * credentials: 'include' kullanıldığında tarayıcı tam Origin gönderir.
     * Sabit liste (localhost, 127.0.0.1) makine adı / LAN hostname (ör. efe-HP-Ubuntu:5173) ile yetmez;
     * Spring Security CORS reddi çoğu zaman 403 görünür.
     * <p>
     * {@code production} profili açık değilken gelen Origin yansıtılır. Prod’da allowlist kullanın.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration config = new CorsConfiguration();
            String origin = request.getHeader(HttpHeaders.ORIGIN);
            if (origin != null) {
                if (!isProductionProfile()) {
                    config.setAllowedOrigins(List.of(origin));
                } else if (isAllowedProductionOrigin(origin)) {
                    config.setAllowedOrigins(List.of(origin));
                }
            }
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
            config.setAllowedHeaders(List.of("*"));
            config.setAllowCredentials(true);
            config.setMaxAge(3600L);
            return config;
        };
    }

    private boolean isProductionProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("production");
    }

    /** Üretimde gerçek frontend URL’lerinizi buraya ekleyin. */
    private static boolean isAllowedProductionOrigin(String origin) {
        return origin.startsWith("https://");
    }
}
