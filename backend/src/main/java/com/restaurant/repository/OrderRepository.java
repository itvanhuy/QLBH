package com.restaurant.repository;

import com.restaurant.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Lấy orders của một customer - dùng cho trang lịch sử
    Page<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    // Lấy orders theo status
    List<Order> findByStatus(Order.Status status);

    // Lấy order active của một bàn (PENDING hoặc CONFIRMED)
    // Dùng để kiểm tra bàn có đang có order không
    @Query("SELECT o FROM Order o WHERE o.table.id = :tableId " +
           "AND o.status IN ('PENDING', 'CONFIRMED')")
    Optional<Order> findActiveOrderByTableId(@Param("tableId") Long tableId);

    // Tìm kiếm orders với filter - dùng cho trang admin/staff
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) " +
           "AND (:tableId IS NULL OR o.table.id = :tableId) " +
           "AND (:fromDate IS NULL OR o.createdAt >= :fromDate) " +
           "AND (:toDate IS NULL OR o.createdAt <= :toDate) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> searchOrders(
            @Param("status")   Order.Status status,
            @Param("tableId")  Long tableId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate")   LocalDateTime toDate,
            Pageable pageable
    );

    // ====================================================
    // Thống kê cho Dashboard
    // ====================================================

    // Tổng doanh thu từ các order COMPLETED
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    // Doanh thu theo ngày (dùng cho chart)
    @Query("SELECT DATE(o.createdAt) as date, COALESCE(SUM(o.totalAmount), 0) as revenue " +
           "FROM Order o WHERE o.status = 'COMPLETED' " +
           "AND o.createdAt BETWEEN :fromDate AND :toDate " +
           "GROUP BY DATE(o.createdAt) ORDER BY date ASC")
    List<Object[]> getRevenueByDateRange(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate")   LocalDateTime toDate
    );

    // Doanh thu theo tháng
    @Query("SELECT MONTH(o.createdAt) as month, YEAR(o.createdAt) as year, " +
           "COALESCE(SUM(o.totalAmount), 0) as revenue " +
           "FROM Order o WHERE o.status = 'COMPLETED' " +
           "AND YEAR(o.createdAt) = :year " +
           "GROUP BY YEAR(o.createdAt), MONTH(o.createdAt) ORDER BY month ASC")
    List<Object[]> getRevenueByMonth(@Param("year") int year);

    // Đếm orders theo status
    long countByStatus(Order.Status status);

    // Lấy 10 orders gần nhất (recent orders cho dashboard)
    List<Order> findTop10ByOrderByCreatedAtDesc();
}
