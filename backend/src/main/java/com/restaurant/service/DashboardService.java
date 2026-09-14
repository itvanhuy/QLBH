package com.restaurant.service;

import com.restaurant.dto.response.DashboardResponse;

import java.util.List;

public interface DashboardService {
    DashboardResponse getStatistics();
    List<DashboardResponse.RevenueDataPoint> getRevenueByDateRange(String from, String to);
    List<DashboardResponse.RevenueDataPoint> getRevenueByYear(int year);
    List<DashboardResponse.TopProductResponse> getTopProducts(int limit);
}
