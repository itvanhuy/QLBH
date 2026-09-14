package com.restaurant.repository;

import com.restaurant.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository cho User entity.
 * JpaRepository<User, Long> cung cấp sẵn:
 *   - findAll(), findById(), save(), delete()
 *   - count(), existsById(), ...
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm user theo email - dùng cho login và kiểm tra duplicate
    Optional<User> findByEmail(String email);

    // Kiểm tra email đã tồn tại chưa - dùng khi đăng ký
    boolean existsByEmail(String email);

    // Tìm kiếm user với phân trang - dùng cho trang admin/users
    // JPQL: tìm theo email HOẶC name (case insensitive)
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (:isActive IS NULL OR u.isActive = :isActive)")
    Page<User> searchUsers(
            @Param("keyword")  String keyword,
            @Param("role")     User.Role role,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    // Đếm số user theo role - dùng cho dashboard
    long countByRole(User.Role role);

    // Đếm user đang active
    long countByIsActive(boolean isActive);
}
