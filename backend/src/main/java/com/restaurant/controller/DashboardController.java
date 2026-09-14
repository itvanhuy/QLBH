package com.restaurant.controller;

import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.DashboardResponse;
import com.restaurant.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;

/**
 * GET /api/dashboard/statistics         - ADMIN
 * GET /api/dashboard/revenue            - ADMIN (theo ngày, ?from=&to=)
 * GET /api/dashboard/revenue/monthly    - ADMIN (theo tháng, ?year=)
 * GET /api/dashboard/top-products       - ADMIN (?limit=10)
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<DashboardResponse>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê thành công",
                dashboardService.getStatistics()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<DashboardResponse.RevenueDataPoint>>> getRevenue(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(ApiResponse.success("Lấy doanh thu theo ngày thành công",
                dashboardService.getRevenueByDateRange(from, to)));
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<ApiResponse<List<DashboardResponse.RevenueDataPoint>>> getRevenueMonthly(
            @RequestParam(defaultValue = "0") int year) {
        int targetYear = year > 0 ? year : Year.now().getValue();
        return ResponseEntity.ok(ApiResponse.success("Lấy doanh thu theo tháng thành công",
                dashboardService.getRevenueByYear(targetYear)));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<DashboardResponse.TopProductResponse>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Lấy top sản phẩm thành công",
                dashboardService.getTopProducts(limit)));
    }
}
