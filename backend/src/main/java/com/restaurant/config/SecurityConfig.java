package com.restaurant.config;

import com.restaurant.security.CustomUserDetailsService;
import com.restaurant.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Cấu hình Spring Security cho toàn bộ ứng dụng.
 *
 * @EnableMethodSecurity: bật @PreAuthorize trên từng method trong Controller/Service
 *
 * Chiến lược bảo mật:
 *   - STATELESS session: không dùng HttpSession, mỗi request tự xác thực bằng JWT
 *   - CSRF disabled: không cần vì dùng JWT (không dùng cookie)
 *   - Public routes: /api/auth/**, /api/products (GET), /api/categories (GET), ...
 *   - Protected routes: yêu cầu JWT hợp lệ
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    /**
     * PasswordEncoder dùng BCrypt với strength 10.
     * Đây là bean dùng ở nhiều nơi (AuthService, test, ...).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /**
     * AuthenticationProvider: kết nối UserDetailsService với PasswordEncoder.
     * Spring Security dùng cái này để verify email + password khi login.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * AuthenticationManager: được inject vào AuthService để trigger authenticate().
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * SecurityFilterChain: cấu hình chính — ai được truy cập đường nào.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Tắt CSRF (không cần khi dùng JWT + stateless)
            .csrf(AbstractHttpConfigurer::disable)

            // Cấu hình CORS - inject CorsConfigurationSource bean từ CorsConfig
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // STATELESS: Spring Security không tạo/dùng HttpSession
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Cấu hình phân quyền theo URL
            .authorizeHttpRequests(auth -> auth

                // ── PUBLIC: ai cũng truy cập được ──────────────────────────
                .requestMatchers("/api/auth/**").permitAll()

                // Menu công khai - GET only
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tables/**").permitAll()

                // ── ADMIN only ─────────────────────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/**").hasRole("ADMIN")

                // DELETE thường chỉ ADMIN
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/tables/**").hasRole("ADMIN")

                // Users management: ADMIN only
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // ── ADMIN hoặc STAFF ───────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT,  "/api/products/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT,  "/api/categories/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.POST, "/api/tables/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT,  "/api/tables/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers("/api/payments/**").hasAnyRole("ADMIN", "STAFF")

                // ── Tất cả request còn lại: phải đăng nhập ────────────────
                .anyRequest().authenticated()
            )

            // Thêm JWT filter VÀO TRƯỚC UsernamePasswordAuthenticationFilter
            // (xử lý JWT → set Authentication → Spring Security check authorization)
            .addFilterBefore(jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class)

            // Set authentication provider
            .authenticationProvider(authenticationProvider());

        return http.build();
    }
}
