package com.restaurant.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO cho Dashboard Admin.
 * GET /api/dashboard/statistics
 */
@Getter
@Builder
public class DashboardResponse {

    // ── Thống kê tổng quan ──────────────────────────────
    private BigDecimal totalRevenue;      // Tổng doanh thu (orders COMPLETED)
    private long totalOrders;            // Tổng số đơn hàng
    private long pendingOrders;          // Đơn đang chờ
    private long confirmedOrders;        // Đơn đang phục vụ
    private long completedOrders;        // Đơn hoàn thành
    private long cancelledOrders;        // Đơn hủy
    private long totalCustomers;         // Tổng khách hàng
    private long totalStaff;             // Tổng nhân viên
    private long totalProducts;          // Tổng món ăn
    private long availableProducts;      // Món đang phục vụ
    private long totalTables;            // Tổng bàn
    private long availableTables;        // Bàn đang trống
    private long occupiedTables;         // Bàn đang có khách

    // ── Orders gần nhất ──────────────────────────────────
    private List<OrderResponse> recentOrders;

    // ── Top món bán chạy ─────────────────────────────────
    private List<TopProductResponse> topProducts;

    // ────────────────────────────────────────────────────
    // Inner DTO: Top sản phẩm bán chạy
    // ────────────────────────────────────────────────────
    @Getter
    @Builder
    public static class TopProductResponse {
        private Long productId;
        private String productName;
        private Long totalQuantity;
        private BigDecimal totalRevenue;
    }

    // ────────────────────────────────────────────────────
    // Inner DTO: Doanh thu theo ngày/tháng
    // ────────────────────────────────────────────────────
    @Getter
    @Builder
    public static class RevenueDataPoint {
        private String label;         // "2026-09-11" hoặc "Tháng 9"
        private BigDecimal revenue;
        private long orderCount;
    }
}
