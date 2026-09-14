package com.restaurant.service.impl;

import com.restaurant.dto.request.UserRequest;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.dto.response.UserResponse;
import com.restaurant.entity.User;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ConflictException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.UserRepository;
import com.restaurant.service.UserService;
import com.restaurant.util.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(String keyword, User.Role role,
                                                  Boolean isActive, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String kw = StringUtils.hasText(keyword) ? keyword : null;

        Page<User> userPage = userRepository.searchUsers(kw, role, isActive, pageable);
        Page<UserResponse> responsePage = userPage.map(UserResponse::fromEntity);
        return PageResponse.of(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = findUserById(id);
        return UserResponse.fromEntity(user);
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = findUserById(id);

        // Kiểm tra email mới có bị trùng với user khác không
        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException(AppConstants.EMAIL_ALREADY_EXISTS);
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        // Chỉ cập nhật password nếu có truyền lên
        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Đổi role nếu có chỉ định
        if (StringUtils.hasText(request.getRole())) {
            try {
                user.setRole(User.Role.valueOf(request.getRole()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Role không hợp lệ: " + request.getRole());
            }
        }

        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        User user = findUserById(id);
        // Không cho xóa chính mình (safety check ở Controller)
        userRepository.delete(user);
        log.info("Đã xóa user id={}", id);
    }

    @Override
    public void lockUser(Long id) {
        User user = findUserById(id);
        if (!user.getIsActive()) {
            throw new BadRequestException("Tài khoản đã bị khóa trước đó");
        }
        user.setIsActive(false);
        userRepository.save(user);
        log.info("Đã khóa user id={}", id);
    }

    @Override
    public void unlockUser(Long id) {
        User user = findUserById(id);
        if (user.getIsActive()) {
            throw new BadRequestException("Tài khoản đang hoạt động bình thường");
        }
        user.setIsActive(true);
        userRepository.save(user);
        log.info("Đã mở khóa user id={}", id);
    }

    @Override
    public void changeRole(Long id, String role) {
        User user = findUserById(id);
        try {
            user.setRole(User.Role.valueOf(role));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Role không hợp lệ: " + role);
        }
        userRepository.save(user);
        log.info("Đã đổi role user id={} sang {}", id, role);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
    }
}
