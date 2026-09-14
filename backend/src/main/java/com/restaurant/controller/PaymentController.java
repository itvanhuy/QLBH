package com.restaurant.controller;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.PaymentResponse;
import com.restaurant.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * POST   /api/payments                    - ADMIN, STAFF (tạo payment)
 * GET    /api/payments/{id}               - ADMIN, STAFF
 * GET    /api/payments/order/{orderId}    - ADMIN, STAFF
 * PATCH  /api/payments/{id}/confirm       - ADMIN, STAFF (xác nhận đã thu tiền)
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo thanh toán thành công",
                        paymentService.createPayment(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thanh toán thành công",
                paymentService.getPaymentById(id)));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrder(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thanh toán theo đơn hàng thành công",
                paymentService.getPaymentByOrderId(orderId)));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Xác nhận thanh toán thành công",
                paymentService.confirmPayment(id)));
    }
}
