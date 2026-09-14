package com.restaurant.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO dùng khi Admin cập nhật thông tin user.
 * PUT /api/users/{id}
 */
@Getter
@Setter
public class UserRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2 đến 100 ký tự")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$",
             message = "Số điện thoại không đúng định dạng")
    private String phone;

    // Null = không đổi mật khẩu
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    // Chỉ Admin mới được đổi role
    private String role;
}
