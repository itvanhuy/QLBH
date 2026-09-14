package com.restaurant.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO cho tạo/cập nhật món ăn.
 */
@Getter
@Setter
public class ProductRequest {

    @NotBlank(message = "Tên món không được để trống")
    @Size(min = 2, max = 200, message = "Tên món phải từ 2 đến 200 ký tự")
    private String name;

    private String description;

    @NotNull(message = "Giá món không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá món phải lớn hơn 0")
    @Digits(integer = 8, fraction = 2, message = "Giá không hợp lệ")
    private BigDecimal price;

    private String imageUrl;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    // Null khi tạo mới → mặc định AVAILABLE trong Service
    private String status;
}
