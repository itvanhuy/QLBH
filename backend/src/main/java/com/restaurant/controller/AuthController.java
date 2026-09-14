package com.restaurant.controller;

import com.restaurant.dto.request.LoginRequest;
import com.restaurant.dto.request.RegisterRequest;
import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.AuthResponse;
import com.restaurant.dto.response.UserResponse;
import com.restaurant.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API Authentication.
 *
 * Controller chỉ:
 *   - Nhận request
 *   - Validate input (@Valid)
 *   - Gọi Service
 *   - Trả response
 *
 * KHÔNG chứa business logic.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     *
     * Body: { "email": "...", "password": "..." }
     *
     * Response 200:
     * {
     *   "success": true,
     *   "message": "Đăng nhập thành công",
     *   "data": {
     *     "token": "eyJ...",
     *     "tokenType": "Bearer",
     *     "user": { "id": 1, "name": "...", "role": "ROLE_ADMIN" }
     *   }
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Đăng nhập thành công", authResponse)
        );
    }

    /**
     * POST /api/auth/register
     *
     * Body: { "name": "...", "email": "...", "password": "...", "phone": "..." }
     *
     * Response 201:
     * {
     *   "success": true,
     *   "message": "Đăng ký thành công",
     *   "data": { "id": 5, "name": "...", "role": "ROLE_CUSTOMER" }
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse userResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công", userResponse));
    }

    /**
     * GET /api/auth/me
     * Header: Authorization: Bearer <token>
     *
     * Trả về thông tin user đang đăng nhập.
     *
     * @AuthenticationPrincipal: Spring Security tự inject UserDetails
     * từ SecurityContext (đã được set bởi JwtAuthenticationFilter)
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {

        UserResponse userResponse = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin thành công", userResponse)
        );
    }
}
