package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity ánh xạ với bảng "users".
 * Dùng @EntityListeners để tự động set createdAt, updatedAt.
 */
@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    // UNIQUE - không cho 2 user cùng email
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    // Luôn lưu dạng BCrypt hash, KHÔNG BAO GIỜ plain text
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "phone", length = 15)
    private String phone;

    // Dùng @Enumerated để JPA lưu chuỗi ("ROLE_ADMIN") thay vì số (0, 1, 2)
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ====================================================
    // Quan hệ 1:N với Orders (một user có nhiều orders)
    // mappedBy = tên field trong Order trỏ về User này
    // FetchType.LAZY: chỉ load orders khi cần (performance)
    // ====================================================
    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    private List<Order> customerOrders;

    @OneToMany(mappedBy = "staff", fetch = FetchType.LAZY)
    private List<Order> staffOrders;

    // ====================================================
    // Enum Role - định nghĩa ngay trong Entity cho gọn
    // ====================================================
    public enum Role {
        ROLE_ADMIN,
        ROLE_STAFF,
        ROLE_CUSTOMER
    }
}
