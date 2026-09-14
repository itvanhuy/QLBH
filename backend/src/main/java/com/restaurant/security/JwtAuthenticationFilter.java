package com.restaurant.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter chạy MỘT LẦN cho mỗi HTTP request.
 * Nhiệm vụ: đọc JWT token từ header → validate → set Authentication vào SecurityContext.
 *
 * Flow:
 *   Request đến
 *     → Đọc "Authorization: Bearer <token>" từ header
 *     → Validate token
 *     → Lấy email từ token
 *     → Load UserDetails từ DB
 *     → Set Authentication vào SecurityContext
 *   → Controller xử lý (đã biết user là ai)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Bước 1: Lấy JWT token từ header
            String jwt = extractTokenFromRequest(request);

            // Bước 2: Validate token
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {

                // Bước 3: Lấy email từ token
                String email = jwtTokenProvider.getUsernameFromToken(jwt);

                // Bước 4: Load UserDetails từ database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Bước 5: Tạo Authentication object và set vào SecurityContext
                // Từ đây, Spring Security biết request này thuộc về user nào
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,                         // credentials = null (đã verify bằng JWT)
                                userDetails.getAuthorities()  // roles của user
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // Không throw exception ở đây - để Spring Security xử lý tiếp
            log.error("Không thể set authentication từ JWT: {}", ex.getMessage());
        }

        // Luôn gọi filterChain để tiếp tục xử lý request
        filterChain.doFilter(request, response);
    }

    /**
     * Trích xuất JWT token từ Authorization header.
     * Header format: "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Bỏ prefix "Bearer "
        }

        return null;
    }
}
