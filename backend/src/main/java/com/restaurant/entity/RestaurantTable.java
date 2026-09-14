package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity ánh xạ với bảng "restaurant_tables".
 * Tên class là RestaurantTable (không phải Table) để tránh
 * trùng với java.sql.Table và từ khóa MySQL.
 */
@Entity
@Table(name = "restaurant_tables")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Số bàn: "01", "02", "A1", ... - UNIQUE
    @Column(name = "table_number", nullable = false, unique = true, length = 10)
    private String tableNumber;

    // Sức chứa (số người)
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private Status status = Status.AVAILABLE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Quan hệ 1:N với Orders
    @OneToMany(mappedBy = "table", fetch = FetchType.LAZY)
    private List<Order> orders;

    // Enum trạng thái bàn
    public enum Status {
        AVAILABLE,  // Trống, có thể đặt
        OCCUPIED,   // Đang có khách
        RESERVED    // Đã đặt trước
    }
}
