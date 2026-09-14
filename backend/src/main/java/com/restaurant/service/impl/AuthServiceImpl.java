package com.restaurant.service.impl;

import com.restaurant.dto.request.LoginRequest;
import com.restaurant.dto.request.RegisterRequest;
import com.restaurant.dto.response.AuthResponse;
import com.restaurant.dto.response.UserResponse;
import com.restaurant.entity.User;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ConflictException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.UserRepository;
import com.restaurant.security.JwtTokenProvider;
import com.restaurant.service.AuthService;
import com.restaurant.util.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation của AuthService.
 *
 * Login flow:
 *   1. AuthenticationManager.authenticate() → Spring Security kiểm tra
 *      email/password qua CustomUserDetailsService + BCrypt
 *   2. Nếu đúng → tạo JWT token
 *   3. Trả về AuthResponse { token, user }
 *
 * Register flow:
 *   1. Kiểm tra email chưa tồn tại
 *   2. Hash password bằng BCrypt
 *   3. Lưu user với ROLE_CUSTOMER
 *   4. Trả về UserResponse
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // ====================================================
    // LOGIN
    // ====================================================
    @Override
    public AuthResponse login(LoginRequest request) {
        // Kiểm tra tài khoản có bị khóa không trước khi authenticate
        // (để trả thông báo rõ ràng hơn)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException(AppConstants.INVALID_CREDENTIALS));

        if (!user.getIsActive()) {
            throw new BadRequestException(AppConstants.ACCOUNT_LOCKED);
        }

        // Dùng AuthenticationManager để verify email + password
        // Nội bộ: gọi CustomUserDetailsService.loadUserByUsername()
        //         so sánh password bằng BCryptPasswordEncoder
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Set vào SecurityContext (optional cho stateless, nhưng best practice)
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Tạo JWT token từ authentication
        String token = jwtTokenProvider.generateToken(authentication);

        log.info("User đăng nhập thành công: {}", request.getEmail());

        return AuthResponse.of(token, UserResponse.fromEntity(user));
    }

    // ====================================================
    // REGISTER
    // ====================================================
    @Override
    public UserResponse register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException(AppConstants.EMAIL_ALREADY_EXISTS);
        }

        // Tạo user mới - hash password trước khi lưu
        User newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
                .phone(request.getPhone())
                .role(User.Role.ROLE_CUSTOMER) // Đăng ký mặc định là CUSTOMER
                .isActive(true)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("User đăng ký mới: {} ({})", savedUser.getEmail(), savedUser.getRole());

        return UserResponse.fromEntity(savedUser);
    }

    // ====================================================
    // GET CURRENT USER
    // ====================================================
    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));

        return UserResponse.fromEntity(user);
    }
}
