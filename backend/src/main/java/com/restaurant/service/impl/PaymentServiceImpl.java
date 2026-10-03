package com.restaurant.service.impl;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.PaymentResponse;
import com.restaurant.entity.Order;
import com.restaurant.entity.Payment;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ConflictException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.PaymentRepository;
import com.restaurant.repository.TableRepository;
import com.restaurant.service.PaymentService;
import com.restaurant.service.ReservationService;
import com.restaurant.util.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Quy trình thanh toán:
 *
 *   Bước 1: createPayment()
 *     - Kiểm tra order tồn tại và đang CONFIRMED
 *     - Kiểm tra order chưa có payment
 *     - Tạo Payment với status = PENDING
 *
 *   Bước 2: confirmPayment()
 *     - Cập nhật Payment status → PAID
 *     - Cập nhật Order status   → COMPLETED
 *     - Cập nhật Table status   → AVAILABLE
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;
    private final ReservationService reservationService;

    // ====================================================
    // TẠO THANH TOÁN (Bước 1)
    // ====================================================
    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.ORDER_NOT_FOUND));

        // Order phải đang CONFIRMED mới được thanh toán
        if (order.getStatus() != Order.Status.CONFIRMED) {
            throw new BadRequestException(
                    "Chỉ có thể thanh toán đơn hàng ở trạng thái CONFIRMED. " +
                    "Trạng thái hiện tại: " + order.getStatus());
        }

        // Kiểm tra order đã có payment chưa
        if (paymentRepository.existsByOrderId(order.getId())) {
            throw new ConflictException(AppConstants.PAYMENT_ALREADY_EXISTS);
        }

        // Parse phương thức thanh toán
        Payment.Method method;
        try {
            method = Payment.Method.valueOf(request.getMethod());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Phương thức thanh toán không hợp lệ: " + request.getMethod()
                    + ". Chấp nhận: CASH, BANKING");
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())  // Lấy tổng tiền từ order
                .method(method)
                .status(Payment.Status.PENDING)
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Tạo payment id={} cho order id={}, amount={}",
                saved.getId(), order.getId(), saved.getAmount());

        return PaymentResponse.fromEntity(saved);
    }

    // ====================================================
    // XÁC NHẬN THANH TOÁN (Bước 2)
    // ====================================================
    @Override
    public PaymentResponse confirmPayment(Long id) {
        Payment payment = findById(id);

        // Chỉ xác nhận được khi đang PENDING
        if (payment.getStatus() != Payment.Status.PENDING) {
            throw new BadRequestException(
                    "Thanh toán không ở trạng thái PENDING. Trạng thái hiện tại: "
                    + payment.getStatus());
        }

        // 1. Cập nhật payment → PAID
        payment.setStatus(Payment.Status.PAID);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // 2. Cập nhật order → COMPLETED
        Order order = payment.getOrder();
        order.setStatus(Order.Status.COMPLETED);
        orderRepository.save(order);

        // 3. Cập nhật bàn → AVAILABLE
        RestaurantTable table = order.getTable();
        table.setStatus(RestaurantTable.Status.AVAILABLE);
        tableRepository.save(table);

        // 4. Đặt bàn liên kết (nếu đơn đến từ đặt bàn trước) tự hoàn tất
        reservationService.handleOrderCompleted(order.getId());

        log.info("Xác nhận thanh toán id={}, order id={}, bàn {} → AVAILABLE",
                id, order.getId(), table.getTableNumber());

        return PaymentResponse.fromEntity(payment);
    }

    // ====================================================
    // GET
    // ====================================================
    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        return PaymentResponse.fromEntity(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PAYMENT_NOT_FOUND));
        return PaymentResponse.fromEntity(payment);
    }

    private Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PAYMENT_NOT_FOUND));
    }
}
