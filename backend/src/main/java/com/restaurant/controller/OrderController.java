package com.restaurant.controller;

import com.restaurant.dto.request.OrderRequest;
import com.restaurant.dto.request.TransferTableRequest;
import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.entity.Order;
import com.restaurant.entity.User;
import com.restaurant.exception.UnauthorizedException;
import com.restaurant.repository.UserRepository;
import com.restaurant.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * GET    /api/orders                   - ADMIN, STAFF (tất cả orders)
 * GET    /api/orders/{id}              - ADMIN, STAFF, Customer (order của mình)
 * GET    /api/orders/my-orders         - CUSTOMER (lịch sử của bản thân)
 * POST   /api/orders                   - Tất cả user đã login
 * PUT    /api/orders/{id}              - ADMIN, STAFF (update items)
 * PATCH  /api/orders/{id}/status       - ADMIN, STAFF
 * DELETE /api/orders/{id}              - ADMIN
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    // ── Admin/Staff: xem tất cả orders ─────────────────────
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) Order.Status status,
            @RequestParam(required = false) Long tableId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công",
                orderService.getAllOrders(status, tableId, page, size)));
    }

    // ── Customer: xem orders của bản thân ──────────────────
    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử đơn hàng thành công",
                orderService.getMyOrders(userDetails.getUsername(), page, size)));
    }

    // ── Xem chi tiết 1 order ────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        OrderResponse response = orderService.getOrderById(id);

        // Customer chỉ được xem đơn hàng của mình
        boolean isCustomer = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(new SimpleGrantedAuthority("ROLE_CUSTOMER").getAuthority()));

        if (isCustomer) {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập lại"));
            // Nếu order không có customer hoặc customer không khớp → 403
            Long orderCustomerId = response.getCustomerId();
            if (orderCustomerId == null || !orderCustomerId.equals(currentUser.getId())) {
                throw new UnauthorizedException("Bạn không có quyền xem đơn hàng này");
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng thành công", response));
    }

        @GetMapping("/table/{tableId}/active")
        @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
        public ResponseEntity<ApiResponse<OrderResponse>> getActiveOrderByTable(@PathVariable Long tableId) {
                return ResponseEntity.ok(ApiResponse.success("Lấy đơn hàng đang hoạt động của bàn thành công",
                                orderService.getActiveOrderByTableId(tableId)));
        }

    // ── Tạo order mới ──────────────────────────────────────
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        OrderResponse response = orderService.createOrder(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo đơn hàng thành công", response));
    }

    // ── Cập nhật items của order (PENDING only) ─────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody OrderRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn hàng thành công",
                orderService.updateOrder(id, request)));
    }

    // ── Thêm món vào đơn đang active (PENDING/CONFIRMED) ────
    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<OrderResponse>> addItemsToOrder(
            @PathVariable Long id,
            @Valid @RequestBody java.util.List<com.restaurant.dto.request.OrderItemRequest> items) {

        return ResponseEntity.ok(ApiResponse.success("Thêm món thành công",
                orderService.addItemsToOrder(id, items)));
    }

    // ── Cập nhật trạng thái order ───────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công",
                orderService.updateOrderStatus(id, body.get("status"))));
    }

    @PatchMapping("/{id}/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<OrderResponse>> transferOrderToTable(
            @PathVariable Long id,
            @Valid @RequestBody TransferTableRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Chuyển bàn thành công",
                orderService.transferOrderToTable(id, request.getTableId())));
    }

    // ── Xóa order ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa đơn hàng thành công"));
    }
}
