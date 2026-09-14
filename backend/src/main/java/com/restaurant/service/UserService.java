package com.restaurant.service;

import com.restaurant.dto.request.UserRequest;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.dto.response.UserResponse;
import com.restaurant.entity.User;

public interface UserService {
    PageResponse<UserResponse> getAllUsers(String keyword, User.Role role, Boolean isActive, int page, int size);
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UserRequest request);
    void deleteUser(Long id);
    void lockUser(Long id);
    void unlockUser(Long id);
    void changeRole(Long id, String role);
}
