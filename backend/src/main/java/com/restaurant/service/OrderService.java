package com.restaurant.service;

import com.restaurant.dto.request.OrderRequest;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.entity.Order;

public interface OrderService {
    PageResponse<OrderResponse> getAllOrders(Order.Status status, Long tableId, int page, int size);
    OrderResponse getOrderById(Long id);
    PageResponse<OrderResponse> getMyOrders(String email, int page, int size);
    OrderResponse createOrder(OrderRequest request, String currentUserEmail);
    OrderResponse updateOrder(Long id, OrderRequest request);
    OrderResponse updateOrderStatus(Long id, String status);
    void deleteOrder(Long id);
}
