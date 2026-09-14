package com.restaurant.service.impl;

import com.restaurant.dto.response.DashboardResponse;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.entity.Order;
import com.restaurant.entity.Product;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.entity.User;
import com.restaurant.repository.*;
import com.restaurant.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final TableRepository tableRepository;
    private final OrderItemRepository orderItemRepository;

    // ====================================================
    // STATISTICS - Thống kê tổng quan
    // ====================================================
    @Override
    public DashboardResponse getStatistics() {
        // Doanh thu tổng
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();

        // Đếm orders theo từng status
        long totalOrders     = orderRepository.count();
        long pendingOrders   = orderRepository.countByStatus(Order.Status.PENDING);
        long confirmedOrders = orderRepository.countByStatus(Order.Status.CONFIRMED);
        long completedOrders = orderRepository.countByStatus(Order.Status.COMPLETED);
        long cancelledOrders = orderRepository.countByStatus(Order.Status.CANCELLED);

        // Đếm users
        long totalCustomers = userRepository.countByRole(User.Role.ROLE_CUSTOMER);
        long totalStaff     = userRepository.countByRole(User.Role.ROLE_STAFF);

        // Đếm products
        long totalProducts     = productRepository.count();
        long availableProducts = productRepository.countByStatus(Product.Status.AVAILABLE);

        // Đếm tables
        long totalTables     = tableRepository.count();
        long availableTables = tableRepository.countByStatus(RestaurantTable.Status.AVAILABLE);
        long occupiedTables  = tableRepository.countByStatus(RestaurantTable.Status.OCCUPIED);

        // 10 orders gần nhất
        List<OrderResponse> recentOrders = orderRepository
                .findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();

        // Top 5 món bán chạy
        List<DashboardResponse.TopProductResponse> topProducts = getTopProducts(5);

        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .totalCustomers(totalCustomers)
                .totalStaff(totalStaff)
                .totalProducts(totalProducts)
                .availableProducts(availableProducts)
                .totalTables(totalTables)
                .availableTables(availableTables)
                .occupiedTables(occupiedTables)
                .recentOrders(recentOrders)
                .topProducts(topProducts)
                .build();
    }

    // ====================================================
    // REVENUE BY DATE RANGE (cho Line/Bar chart theo ngày)
    // ====================================================
    @Override
    public List<DashboardResponse.RevenueDataPoint> getRevenueByDateRange(String from, String to) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        LocalDateTime fromDate = from != null
                ? LocalDate.parse(from, fmt).atStartOfDay()
                : LocalDate.now().minusDays(29).atStartOfDay();   // Mặc định 30 ngày gần nhất

        LocalDateTime toDate = to != null
                ? LocalDate.parse(to, fmt).atTime(23, 59, 59)
                : LocalDate.now().atTime(23, 59, 59);

        List<Object[]> rawData = orderRepository.getRevenueByDateRange(fromDate, toDate);
        List<DashboardResponse.RevenueDataPoint> result = new ArrayList<>();

        for (Object[] row : rawData) {
            result.add(DashboardResponse.RevenueDataPoint.builder()
                    .label(row[0].toString())                           // date string
                    .revenue(new BigDecimal(row[1].toString()))         // sum amount
                    .orderCount(0L)                                     // optional
                    .build());
        }

        return result;
    }

    // ====================================================
    // REVENUE BY MONTH (cho Bar chart theo tháng)
    // ====================================================
    @Override
    public List<DashboardResponse.RevenueDataPoint> getRevenueByYear(int year) {
        List<Object[]> rawData = orderRepository.getRevenueByMonth(year);
        List<DashboardResponse.RevenueDataPoint> result = new ArrayList<>();

        for (Object[] row : rawData) {
            int month = ((Number) row[0]).intValue();
            result.add(DashboardResponse.RevenueDataPoint.builder()
                    .label("Tháng " + month)
                    .revenue(new BigDecimal(row[2].toString()))
                    .orderCount(0L)
                    .build());
        }

        return result;
    }

    // ====================================================
    // TOP SELLING PRODUCTS
    // ====================================================
    @Override
    public List<DashboardResponse.TopProductResponse> getTopProducts(int limit) {
        List<Object[]> rawData = orderItemRepository
                .findTopSellingProducts(PageRequest.of(0, limit));

        List<DashboardResponse.TopProductResponse> result = new ArrayList<>();
        for (Object[] row : rawData) {
            result.add(DashboardResponse.TopProductResponse.builder()
                    .productId(((Number) row[0]).longValue())
                    .productName(row[1].toString())
                    .totalQuantity(((Number) row[2]).longValue())
                    .totalRevenue(new BigDecimal(row[3].toString()))
                    .build());
        }

        return result;
    }
}
