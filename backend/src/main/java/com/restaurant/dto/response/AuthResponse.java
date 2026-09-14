package com.restaurant.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * DTO trả về sau khi đăng nhập thành công.
 *
 * Response format:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiJ9...",
 *   "tokenType": "Bearer",
 *   "user": {
 *     "id": 1,
 *     "name": "Nguyen Van A",
 *     "email": "admin@gmail.com",
 *     "role": "ROLE_ADMIN",
 *     ...
 *   }
 * }
 */
@Getter
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;   // Luôn là "Bearer"
    private UserResponse user;

    public static AuthResponse of(String token, UserResponse user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(user)
                .build();
    }
}
