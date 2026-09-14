package com.restaurant.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO cho tạo/cập nhật bàn ăn.
 */
@Getter
@Setter
public class TableRequest {

    @NotBlank(message = "Số bàn không được để trống")
    @Size(max = 10, message = "Số bàn tối đa 10 ký tự")
    private String tableNumber;

    @Min(value = 1, message = "Sức chứa phải ít nhất 1 người")
    private Integer capacity;

    // Null khi tạo mới → mặc định AVAILABLE
    private String status;
}
