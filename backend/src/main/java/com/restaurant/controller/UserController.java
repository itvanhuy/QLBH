package com.restaurant.controller;

import com.restaurant.dto.request.UserRequest;
import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.dto.response.UserResponse;
import com.restaurant.entity.User;
import com.restaurant.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * GET    /api/users                   - Danh sách users (ADMIN)
 * GET    /api/users/{id}              - Chi tiết user (ADMIN)
 * PUT    /api/users/{id}              - Cập nhật (ADMIN)
 * DELETE /api/users/{id}              - Xóa (ADMIN)
 * PATCH  /api/users/{id}/lock         - Khóa (ADMIN)
 * PATCH  /api/users/{id}/unlock       - Mở khóa (ADMIN)
 * PATCH  /api/users/{id}/role         - Đổi role (ADMIN)
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")   // Toàn bộ controller: chỉ ADMIN
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) User.Role role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageResponse<UserResponse> data = userService.getAllUsers(keyword, role, isActive, page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách user thành công", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin user thành công",
                userService.getUserById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật user thành công",
                userService.updateUser(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails currentUser) {
        // Không cho xóa chính mình
        UserResponse target = userService.getUserById(id);
        if (target.getEmail().equals(currentUser.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Không thể xóa tài khoản đang đăng nhập"));
        }
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa user thành công"));
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<Void>> lockUser(@PathVariable Long id) {
        userService.lockUser(id);
        return ResponseEntity.ok(ApiResponse.success("Khóa tài khoản thành công"));
    }

    @PatchMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<Void>> unlockUser(@PathVariable Long id) {
        userService.unlockUser(id);
        return ResponseEntity.ok(ApiResponse.success("Mở khóa tài khoản thành công"));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<Void>> changeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        userService.changeRole(id, body.get("role"));
        return ResponseEntity.ok(ApiResponse.success("Thay đổi role thành công"));
    }
}
