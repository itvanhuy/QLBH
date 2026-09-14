package com.restaurant.repository;

import com.restaurant.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Lấy danh sách product theo category
    List<Product> findByCategoryId(Long categoryId);

    // Lấy danh sách product theo status (AVAILABLE / UNAVAILABLE)
    List<Product> findByStatus(Product.Status status);

    // Tìm kiếm product với filter - dùng cho trang menu và admin
    @Query("SELECT p FROM Product p WHERE " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:status IS NULL OR p.status = :status)")
    Page<Product> searchProducts(
            @Param("keyword")    String keyword,
            @Param("categoryId") Long categoryId,
            @Param("status")     Product.Status status,
            Pageable pageable
    );

    // Đếm số product theo status - dashboard
    long countByStatus(Product.Status status);

    // Lấy product available theo category (dùng cho menu public)
    List<Product> findByCategoryIdAndStatus(Long categoryId, Product.Status status);

    // Kiểm tra category còn product không (trước khi xóa category)
    boolean existsByCategoryId(Long categoryId);
}
