package com.restaurant.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * DTO cho tạo đơn hàng mới.
 * POST /api/orders
 */
@Getter
@Setter
public class OrderRequest {

    @NotNull(message = "Bàn không được để trống")
    private Long tableId;

    // Null nếu staff tạo order mà không gắn với customer cụ thể
    private Long customerId;

    @NotEmpty(message = "Đơn hàng phải có ít nhất 1 món")
    @Valid
    private List<OrderItemRequest> items;

    private String voucherCode;

    private String note;
}
