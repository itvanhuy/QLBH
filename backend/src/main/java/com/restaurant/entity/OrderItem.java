package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Entity ánh xạ với bảng "order_items".
 * Chi tiết từng món trong một đơn hàng.
 *
 * Quan trọng: field "price" lưu giá tại thời điểm đặt hàng,
 * KHÔNG phải giá hiện tại của product. Điều này đảm bảo
 * lịch sử order không bị thay đổi khi admin chỉnh giá món.
 */
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ N:1 với Order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Quan hệ N:1 với Product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    // Giá tại thời điểm đặt hàng (snapshot từ product.price)
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Thành tiền = price × quantity
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    // ====================================================
    // Helper: tính lại subtotal khi thay đổi quantity
    // ====================================================
    public void calculateSubtotal() {
        this.subtotal = this.price.multiply(BigDecimal.valueOf(this.quantity));
    }
}
