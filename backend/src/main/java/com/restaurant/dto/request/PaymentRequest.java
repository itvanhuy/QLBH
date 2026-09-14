package com.restaurant.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO cho tạo thanh toán.
 * POST /api/payments
 */
@Getter
@Setter
public class PaymentRequest {

    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String method; // "CASH" hoặc "BANKING"
}
