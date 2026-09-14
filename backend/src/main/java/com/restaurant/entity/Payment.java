package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ với bảng "payments".
 * Quan hệ 1:1 với Order - mỗi order chỉ có 1 payment.
 *
 * Đối với đồ án sinh viên, không tích hợp cổng thanh toán thật.
 * Chỉ mô phỏng: tạo payment → confirm → PAID.
 */
@Entity
@Table(name = "payments")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ 1:1 với Order
    // @JoinColumn: payment giữ foreign key (order_id)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, length = 10)
    private Method method;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private Status status = Status.PENDING;

    // Thời điểm thanh toán thành công, null nếu chưa thanh toán
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Enum phương thức thanh toán
    public enum Method {
        CASH,    // Tiền mặt
        BANKING  // Chuyển khoản ngân hàng
    }

    // Enum trạng thái thanh toán
    public enum Status {
        PENDING,  // Chờ thanh toán
        PAID,     // Đã thanh toán
        FAILED    // Thất bại / hủy
    }
}
