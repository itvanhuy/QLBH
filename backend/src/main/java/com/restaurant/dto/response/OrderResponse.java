package com.restaurant.dto.response;

import com.restaurant.entity.Order;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {

    private Long id;
    private Long tableId;
    private String tableNumber;
    private Long customerId;
    private String customerName;
    private Long staffId;
    private String staffName;
    private String voucherCode;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String status;
    private String note;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponse fromEntity(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                // Customer có thể null
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getName() : null)
                // Staff có thể null
                .staffId(order.getStaff() != null ? order.getStaff().getId() : null)
                .staffName(order.getStaff() != null ? order.getStaff().getName() : null)
                .voucherCode(order.getVoucherCode())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .note(order.getNote())
                .items(order.getItems().stream()
                        .map(OrderItemResponse::fromEntity)
                        .toList())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
