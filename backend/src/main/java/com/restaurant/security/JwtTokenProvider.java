package com.restaurant.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Chịu trách nhiệm tạo, parse và validate JWT token.
 *
 * Flow:
 *   Login thành công → generateToken(authentication) → trả token cho client
 *   Mỗi request tiếp theo → client gửi token trong header "Authorization: Bearer <token>"
 *   JwtAuthenticationFilter gọi validateToken() và getUsernameFromToken()
 */
@Component
@Slf4j
public class JwtTokenProvider {

    // Lấy giá trị từ application.properties
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    /**
     * Tạo SecretKey từ chuỗi secret trong config.
     * HMAC-SHA256 yêu cầu key >= 256 bit (= 32 bytes).
     */
    private SecretKey getSigningKey() {
        // Encode secret theo UTF-8 rồi tạo key
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        // Đảm bảo key đủ dài cho HMAC-SHA256 (>= 32 bytes)
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret quá ngắn (" + keyBytes.length + " bytes). Cần tối thiểu 32 ký tự cho HMAC-SHA256.");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Tạo JWT token sau khi đăng nhập thành công.
     *
     * @param authentication - đối tượng authentication sau khi verify
     * @return JWT token string dạng "xxxxx.yyyyy.zzzzz"
     */
    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userPrincipal.getUsername())   // subject = email
                .issuedAt(now)                          // thời điểm tạo
                .expiration(expiryDate)                 // thời điểm hết hạn
                .signWith(getSigningKey())               // ký bằng HMAC-SHA256
                .compact();
    }

    /**
     * Tạo token từ email trực tiếp (dùng cho một số trường hợp đặc biệt).
     */
    public String generateTokenFromEmail(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Lấy email (subject) từ JWT token.
     * Dùng trong JwtAuthenticationFilter để load UserDetails.
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Kiểm tra token có hợp lệ không.
     * Trả về false nếu: sai chữ ký, hết hạn, sai định dạng, ...
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            log.error("JWT token không đúng định dạng: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token đã hết hạn: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token không được hỗ trợ: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims rỗng: {}", e.getMessage());
        }
        return false;
    }
}
