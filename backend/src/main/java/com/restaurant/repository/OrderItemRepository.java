package com.restaurant.repository;

import com.restaurant.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Lấy tất cả items của một order
    List<OrderItem> findByOrderId(Long orderId);

    // Xóa tất cả items của một order (dùng khi cập nhật lại order)
    void deleteByOrderId(Long orderId);

    // Top N sản phẩm bán chạy nhất - dùng cho dashboard
    @Query("SELECT oi.product.id, oi.product.name, SUM(oi.quantity) as totalQty, " +
           "SUM(oi.subtotal) as totalRevenue " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.status = 'COMPLETED' " +
           "GROUP BY oi.product.id, oi.product.name " +
           "ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProducts(org.springframework.data.domain.Pageable pageable);
}
