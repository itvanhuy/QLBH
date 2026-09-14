package com.restaurant.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Cấu hình CORS (Cross-Origin Resource Sharing).
 *
 * Cần thiết vì Frontend (localhost:3000) và Backend (localhost:8080)
 * chạy trên 2 port khác nhau → trình duyệt sẽ block request nếu không có CORS.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Cho phép request từ React dev server
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",   // React Vite dev
                "http://localhost:5173",   // React Vite alt port
                "http://127.0.0.1:3000"
        ));

        // Cho phép tất cả HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Cho phép các header cần thiết (quan trọng: Authorization cho JWT)
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With"
        ));

        // Cho phép gửi cookies/credentials (cần cho Authorization header)
        config.setAllowCredentials(true);

        // Cache preflight request 1 giờ (tránh OPTIONS request liên tục)
        config.setMaxAge(3600L);

        // Áp dụng config cho tất cả endpoints /api/**
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);

        return source;
    }
}
