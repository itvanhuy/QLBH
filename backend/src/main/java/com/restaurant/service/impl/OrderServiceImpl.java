package com.restaurant.service.impl;

import com.restaurant.dto.request.OrderItemRequest;
import com.restaurant.dto.request.OrderRequest;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.entity.*;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.*;
import com.restaurant.service.OrderService;
import com.restaurant.util.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * OrderService chứa business logic phức tạp nhất:
 *
 * Tạo order:
 *   1. Kiểm tra bàn tồn tại
 *   2. Kiểm tra bàn không có order active khác (PENDING/CONFIRMED)
 *   3. Kiểm tra từng món tồn tại và đang AVAILABLE
 *   4. Tạo Order + OrderItems
 *   5. Tính totalAmount
 *   6. Cập nhật bàn sang OCCUPIED
 *
 * Cập nhật status → COMPLETED hoặc CANCELLED:
 *   → Bàn trở về AVAILABLE
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TableRepository tableRepository;
    private final ProductRepository productRepository;
    private final VoucherRepository voucherRepository;

    // ====================================================
    // GET ALL (Admin/Staff)
    // ====================================================
    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(Order.Status status, Long tableId,
                                                    int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.searchOrders(status, tableId, null, null, pageable);
        return PageResponse.of(orderPage.map(OrderResponse::fromEntity));
    }

    // ====================================================
    // GET BY ID
    // ====================================================
    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        return OrderResponse.fromEntity(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getActiveOrderByTableId(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.TABLE_NOT_FOUND));

        Order activeOrder = orderRepository.findActiveOrderByTableId(table.getId())
                .orElseThrow(() -> new BadRequestException("Bàn " + table.getTableNumber() + " hiện không có đơn hàng đang hoạt động"));

        return OrderResponse.fromEntity(activeOrder);
    }

    // ====================================================
    // GET MY ORDERS (Customer)
    // ====================================================
    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getMyOrders(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository
                .findByCustomerIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PageResponse.of(orderPage.map(OrderResponse::fromEntity));
    }

    // ====================================================
    // CREATE ORDER
    // ====================================================
    @Override
    public OrderResponse createOrder(OrderRequest request, String currentUserEmail) {
        // 1. Kiểm tra bàn
        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.TABLE_NOT_FOUND));

        // 2. Kiểm tra bàn không có order active (PENDING/CONFIRMED)
        orderRepository.findActiveOrderByTableId(table.getId()).ifPresent(existing -> {
            throw new BadRequestException(
                    "Bàn " + table.getTableNumber() + " đang có đơn hàng chưa hoàn thành (ID: " + existing.getId() + ")");
        });

        // 3. Xác định user hiện tại (staff hoặc customer tự đặt)
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));

        // 4. Xác định customer (nếu staff tạo hộ)
        User customer = null;
        User staff = null;

        if (currentUser.getRole() == User.Role.ROLE_CUSTOMER) {
            customer = currentUser;
        } else {
            // Staff/Admin đang tạo
            staff = currentUser;
            if (request.getCustomerId() != null) {
                customer = userRepository.findById(request.getCustomerId())
                        .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
            }
        }

        // 5. Tạo Order entity
        Order order = Order.builder()
                .table(table)
                .customer(customer)
                .staff(staff)
                .note(request.getNote())
                .status(Order.Status.PENDING)
                .items(new ArrayList<>())
                .build();

        // 6. Tạo OrderItems từ request
        List<OrderItem> items = buildOrderItems(request.getItems(), order);
        order.setItems(items);

        // 7. Tính tiền trước khi giảm
        order.recalculateTotalAmount();

        // 8. Áp dụng voucher nếu có
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            applyVoucher(order, request.getVoucherCode());
        }

        // 9. Lưu order
        Order savedOrder = orderRepository.save(order);

        // 10. Cập nhật bàn sang OCCUPIED
        table.setStatus(RestaurantTable.Status.OCCUPIED);
        tableRepository.save(table);

        log.info("Tạo order mới id={} cho bàn={}", savedOrder.getId(), table.getTableNumber());
        return OrderResponse.fromEntity(savedOrder);
    }

    // ====================================================
    // UPDATE ORDER (thay đổi items)
    // ====================================================
    @Override
    public OrderResponse updateOrder(Long id, OrderRequest request) {
        Order order = findById(id);

        // Chỉ cập nhật được khi đang PENDING
        if (order.getStatus() != Order.Status.PENDING) {
            throw new BadRequestException(
                    "Chỉ có thể cập nhật đơn hàng ở trạng thái PENDING");
        }

        // Xóa items cũ và tạo lại (orphanRemoval = true sẽ xóa tự động)
        order.getItems().clear();

        List<OrderItem> newItems = buildOrderItems(request.getItems(), order);
        order.getItems().addAll(newItems);
        order.setNote(request.getNote());
        order.recalculateTotalAmount();

        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    // ====================================================
    // UPDATE STATUS
    // ====================================================
    @Override
    public OrderResponse updateOrderStatus(Long id, String statusStr) {
        Order order = findById(id);

        Order.Status newStatus;
        try {
            newStatus = Order.Status.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái không hợp lệ: " + statusStr);
        }

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);

        // Khi order hoàn thành hoặc hủy → bàn trở về AVAILABLE
        if (newStatus == Order.Status.COMPLETED || newStatus == Order.Status.CANCELLED) {
            RestaurantTable table = order.getTable();
            table.setStatus(RestaurantTable.Status.AVAILABLE);
            tableRepository.save(table);
            log.info("Bàn {} trở về AVAILABLE (order {} -> {})",
                    table.getTableNumber(), id, newStatus);
        }

        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    @Override
    public OrderResponse transferOrderToTable(Long orderId, Long targetTableId) {
        Order order = findById(orderId);

        if (order.getStatus() == Order.Status.COMPLETED || order.getStatus() == Order.Status.CANCELLED) {
            throw new BadRequestException("Không thể chuyển bàn cho đơn hàng đã hoàn tất hoặc đã hủy");
        }

        RestaurantTable sourceTable = order.getTable();
        RestaurantTable targetTable = tableRepository.findById(targetTableId)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.TABLE_NOT_FOUND));

        if (sourceTable.getId().equals(targetTable.getId())) {
            return OrderResponse.fromEntity(order);
        }

        orderRepository.findActiveOrderByTableId(targetTable.getId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(order.getId())) {
                        throw new BadRequestException("Bàn " + targetTable.getTableNumber() + " đang có đơn hàng khác chưa hoàn tất");
                    }
                });

        order.setTable(targetTable);

        boolean sourceHasAnotherActiveOrder = orderRepository.findActiveOrderByTableId(sourceTable.getId())
                .map(existing -> !existing.getId().equals(order.getId()))
                .orElse(false);

        sourceTable.setStatus(sourceHasAnotherActiveOrder ? RestaurantTable.Status.OCCUPIED : RestaurantTable.Status.AVAILABLE);
        targetTable.setStatus(RestaurantTable.Status.OCCUPIED);

        tableRepository.save(sourceTable);
        tableRepository.save(targetTable);
        Order saved = orderRepository.save(order);

        log.info("Chuyển order id={} từ bàn {} sang bàn {}", saved.getId(), sourceTable.getTableNumber(), targetTable.getTableNumber());

        return OrderResponse.fromEntity(saved);
    }

    // ====================================================
    // DELETE ORDER
    // ====================================================
    @Override
    public void deleteOrder(Long id) {
        Order order = findById(id);

        // Nếu order đang active → trả bàn về AVAILABLE
        if (order.getStatus() == Order.Status.PENDING
                || order.getStatus() == Order.Status.CONFIRMED) {
            order.getTable().setStatus(RestaurantTable.Status.AVAILABLE);
            tableRepository.save(order.getTable());
        }

        orderRepository.delete(order);
        log.info("Đã xóa order id={}", id);
    }

    // ====================================================
    // PRIVATE HELPERS
    // ====================================================

    /**
     * Tạo danh sách OrderItem từ request.
     * Kiểm tra từng sản phẩm tồn tại và đang AVAILABLE.
     * Snapshot giá tại thời điểm đặt.
     */
    private void applyVoucher(Order order, String code) {
        Voucher voucher = voucherRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim())
                .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa"));

        if (voucher.getStartAt() != null && LocalDateTime.now().isBefore(voucher.getStartAt())) {
            throw new BadRequestException("Mã giảm giá chưa bắt đầu áp dụng");
        }

        if (voucher.getEndAt() != null && LocalDateTime.now().isAfter(voucher.getEndAt())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn");
        }

        if (voucher.getUsageLimit() > 0 && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
        }

        if (order.getTotalAmount().compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Đơn hàng chưa đạt mức tối thiểu để áp dụng mã " + voucher.getCode());
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (voucher.getType() == Voucher.Type.PERCENT) {
            discount = order.getTotalAmount()
                    .multiply(voucher.getValue())
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            discount = voucher.getValue();
            if (discount.compareTo(order.getTotalAmount()) > 0) {
                discount = order.getTotalAmount();
            }
        }

        order.setVoucherCode(voucher.getCode());
        order.setDiscountAmount(discount);
        order.setTotalAmount(order.getTotalAmount().subtract(discount));

        voucher.setUsedCount((voucher.getUsedCount() == null ? 0 : voucher.getUsedCount()) + 1);
        voucherRepository.save(voucher);
    }

    private List<OrderItem> buildOrderItems(List<OrderItemRequest> itemRequests, Order order) {
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest req : itemRequests) {
            Product product = productRepository.findById(req.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Món ăn ID " + req.getProductId() + " không tồn tại"));

            if (product.getStatus() != Product.Status.AVAILABLE) {
                throw new BadRequestException(
                        "Món '" + product.getName() + "' hiện không còn phục vụ");
            }

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(req.getQuantity())
                    .price(product.getPrice())   // Snapshot giá hiện tại
                    .build();

            item.calculateSubtotal();  // subtotal = price × quantity
            items.add(item);
        }

        return items;
    }

    /**
     * Kiểm tra chuyển trạng thái hợp lệ.
     *
     * PENDING    → CONFIRMED, CANCELLED
     * CONFIRMED  → COMPLETED, CANCELLED
     * COMPLETED  → (không thể đổi)
     * CANCELLED  → (không thể đổi)
     */
    private void validateStatusTransition(Order.Status current, Order.Status next) {
        boolean valid = switch (current) {
            case PENDING   -> next == Order.Status.CONFIRMED || next == Order.Status.CANCELLED;
            case CONFIRMED -> next == Order.Status.COMPLETED || next == Order.Status.CANCELLED;
            case COMPLETED, CANCELLED -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    "Không thể chuyển trạng thái từ " + current + " sang " + next);
        }
    }

    private Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.ORDER_NOT_FOUND));
    }
}
