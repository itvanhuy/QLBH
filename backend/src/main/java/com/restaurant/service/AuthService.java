package com.restaurant.service;

import com.restaurant.dto.request.LoginRequest;
import com.restaurant.dto.request.RegisterRequest;
import com.restaurant.dto.response.AuthResponse;
import com.restaurant.dto.response.UserResponse;

/**
 * Interface định nghĩa các chức năng Authentication.
 * Tách interface và implementation giúp dễ test (mock) và mở rộng sau này.
 */
public interface AuthService {

    /**
     * Đăng nhập - xác thực email/password, trả về JWT token.
     */
    AuthResponse login(LoginRequest request);

    /**
     * Đăng ký tài khoản mới - mặc định ROLE_CUSTOMER.
     */
    UserResponse register(RegisterRequest request);

    /**
     * Lấy thông tin user hiện tại từ email trong JWT.
     */
    UserResponse getCurrentUser(String email);
}
