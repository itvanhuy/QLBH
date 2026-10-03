package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity ánh xạ với bảng "orders".
 * Đây là entity trung tâm của hệ thống.
 *
 * Lưu ý quan hệ:
 *   - table: bàn nào đang phục vụ order này
 *   - customer: khách hàng tạo order (nullable nếu staff tạo hộ)
 *   - staff: nhân viên xử lý order (nullable nếu khách tự đặt)
 *   - items: danh sách món trong order (cascade ALL)
 *   - payment: thông tin thanh toán (1:1)
 */
@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Bàn ăn - bắt buộc
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private RestaurantTable table;

    // Khách hàng - có thể null nếu staff tạo trực tiếp
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    // Nhân viên xử lý - có thể null nếu khách tự đặt online
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;

    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ====================================================
    // Quan hệ 1:N với OrderItems
    // CascadeType.ALL: tạo/sửa/xóa order sẽ ảnh hưởng items
    // orphanRemoval: xóa item khỏi list = xóa khỏi DB
    // ====================================================
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    // Quan hệ 1:1 với Payment
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL,
              fetch = FetchType.LAZY)
    private Payment payment;

    // ====================================================
    // Helper method: tính lại tổng tiền từ các items (trừ giảm giá nếu có)
    // Gọi method này mỗi khi thêm/xóa/sửa items
    // ====================================================
    public void recalculateTotalAmount() {
        BigDecimal subtotal = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discount = (this.discountAmount != null) ? this.discountAmount : BigDecimal.ZERO;
        this.totalAmount = subtotal.subtract(discount);
        if (this.totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            this.totalAmount = BigDecimal.ZERO;
        }
    }

    // Enum trạng thái đơn hàng - theo flow bán hàng
    public enum Status {
        PENDING,    // Mới tạo, chờ xác nhận
        CONFIRMED,  // Đã xác nhận, đang phục vụ
        COMPLETED,  // Đã thanh toán, hoàn tất
        CANCELLED   // Đã hủy
    }
}
