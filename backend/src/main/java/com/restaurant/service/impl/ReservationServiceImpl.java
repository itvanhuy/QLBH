package com.restaurant.service.impl;

import com.restaurant.dto.request.ReservationRequest;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.dto.response.ReservationResponse;
import com.restaurant.entity.Order;
import com.restaurant.entity.Reservation;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.entity.User;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.ReservationRepository;
import com.restaurant.repository.TableRepository;
import com.restaurant.repository.UserRepository;
import com.restaurant.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * Quy trình đặt bàn theo thực tế nhà hàng:
 *
 *   Khách đặt bàn (PENDING)
 *     → Nhân viên xác nhận + xếp bàn (CONFIRMED)
 *     → Khách đến: nhân viên "Đón khách" (CHECKED_IN)
 *         · bàn chuyển OCCUPIED
 *         · tự tạo đơn hàng trống để gọi món, gắn với đặt bàn
 *     → Khách thanh toán đơn hàng → đặt bàn tự COMPLETED, bàn về AVAILABLE
 *     → Khách không đến: NO_SHOW   |   Hủy trước khi đến: CANCELLED
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final TableRepository tableRepository;
    private final OrderRepository orderRepository;

    @Override
    public ReservationResponse createReservation(ReservationRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // Parse date/time
        LocalDate date;
        LocalTime time;
        try {
            date = LocalDate.parse(request.getReservationDate());
            time = LocalTime.parse(request.getReservationTime());
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Định dạng ngày/giờ không hợp lệ (yyyy-MM-dd / HH:mm)");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Ngày đặt bàn phải là ngày trong tương lai");
        }

        // Theo quy trình nhà hàng: khách chỉ nêu ngày/giờ/số người,
        // nhân viên sẽ xếp bàn phù hợp khi xác nhận
        Reservation reservation = Reservation.builder()
                .customer(customer)
                .guestCount(request.getGuestCount())
                .reservationDate(date)
                .reservationTime(time)
                .note(request.getNote())
                .status(Reservation.Status.PENDING)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Tạo đặt bàn mới id={} cho customer={}", saved.getId(), customerEmail);
        return ReservationResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> getMyReservations(String email, int page, int size) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        var pageable = PageRequest.of(page, size, Sort.by("reservationDate").descending());
        Page<Reservation> p = reservationRepository
                .findByCustomerIdOrderByReservationDateDesc(customer.getId(), pageable);
        return PageResponse.of(p.map(ReservationResponse::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> getAllReservations(Reservation.Status status, String date, int page, int size) {
        var pageable = PageRequest.of(page, size);
        LocalDate localDate = StringUtils.hasText(date) ? LocalDate.parse(date) : null;
        Page<Reservation> p = reservationRepository.searchReservations(status, localDate, pageable);
        return PageResponse.of(p.map(ReservationResponse::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getById(Long id) {
        return ReservationResponse.fromEntity(findById(id));
    }

    /**
     * Chuyển trạng thái đặt bàn (Admin/Staff).
     *
     * PENDING / CONFIRMED → CONFIRMED (xác nhận hoặc đổi bàn), CANCELLED, NO_SHOW
     * CHECKED_IN          → không đổi thủ công (hoàn tất tự động khi thanh toán)
     * COMPLETED           → không đổi thủ công
     */
    @Override
    public ReservationResponse updateStatus(Long id, String statusStr, Long tableId) {
        Reservation reservation = findById(id);

        Reservation.Status newStatus;
        try {
            newStatus = Reservation.Status.valueOf(statusStr);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BadRequestException("Trạng thái không hợp lệ: " + statusStr);
        }

        Reservation.Status current = reservation.getStatus();

        switch (newStatus) {
            case CONFIRMED -> {
                if (current != Reservation.Status.PENDING && current != Reservation.Status.CONFIRMED) {
                    throw new BadRequestException("Không thể xác nhận đặt bàn đang ở trạng thái " + current);
                }
                if (tableId != null) {
                    validateAndAssignTable(reservation, tableId);
                } else if (reservation.getTable() == null) {
                    throw new BadRequestException("Cần chọn bàn khi xác nhận đặt bàn");
                }
                reservation.setStatus(Reservation.Status.CONFIRMED);
            }
            case CANCELLED -> {
                if (current != Reservation.Status.PENDING && current != Reservation.Status.CONFIRMED) {
                    throw new BadRequestException("Không thể hủy đặt bàn ở trạng thái " + current);
                }
                reservation.setStatus(Reservation.Status.CANCELLED);
            }
            case NO_SHOW -> {
                if (current != Reservation.Status.PENDING && current != Reservation.Status.CONFIRMED) {
                    throw new BadRequestException("Không thể đánh dấu 'không đến' cho đặt bàn ở trạng thái " + current);
                }
                reservation.setStatus(Reservation.Status.NO_SHOW);
            }
            case CHECKED_IN -> throw new BadRequestException(
                    "Vui lòng dùng chức năng 'Đón khách' để khách vào bàn (hệ thống tự tạo đơn hàng)");
            case COMPLETED -> throw new BadRequestException(
                    "Đặt bàn tự hoàn tất khi khách thanh toán đơn hàng, không thể đánh dấu thủ công");
            default -> throw new BadRequestException("Trạng thái không hợp lệ: " + statusStr);
        }

        return ReservationResponse.fromEntity(reservationRepository.save(reservation));
    }

    /**
     * Đón khách: khách đến nhà hàng theo đặt bàn.
     * - Đổi bàn tại thời điểm đến nếu khách yêu cầu
     * - Bàn chuyển sang OCCUPIED
     * - Tự tạo đơn hàng trống (nhân viên gọi món vào đơn này)
     * - Đặt bàn → CHECKED_IN (nếu chưa xác nhận thì coi như xác nhận khi khách đến)
     */
    @Override
    public ReservationResponse checkIn(Long id, Long tableId, String staffEmail) {
        Reservation reservation = findById(id);
        Reservation.Status current = reservation.getStatus();

        if (current == Reservation.Status.CHECKED_IN) {
            throw new BadRequestException("Khách của đặt bàn #" + id + " đã được đón vào bàn rồi");
        }
        if (current != Reservation.Status.PENDING && current != Reservation.Status.CONFIRMED) {
            throw new BadRequestException("Không thể đón khách cho đặt bàn ở trạng thái " + current);
        }

        if (tableId != null
                && (reservation.getTable() == null || !tableId.equals(reservation.getTable().getId()))) {
            validateAndAssignTable(reservation, tableId);
        }

        RestaurantTable table = reservation.getTable();
        if (table == null) {
            throw new BadRequestException("Chưa xếp bàn cho đặt bàn này, vui lòng chọn bàn trước khi đón khách");
        }

        // Bàn phải thực sự trống (không có đơn hàng đang hoạt động)
        orderRepository.findActiveOrderByTableId(table.getId()).ifPresent(active -> {
            throw new BadRequestException("Bàn " + table.getTableNumber()
                    + " đang có đơn hàng chưa hoàn thành (ID: " + active.getId() + "), vui lòng chọn bàn khác");
        });

        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Order order = Order.builder()
                .table(table)
                .customer(reservation.getCustomer())
                .staff(staff)
                .note("Đơn hàng từ đặt bàn #" + reservation.getId())
                .status(Order.Status.PENDING)
                .items(new ArrayList<>())
                .build();
        Order savedOrder = orderRepository.save(order);

        // Khách vào bàn
        table.setStatus(RestaurantTable.Status.OCCUPIED);
        tableRepository.save(table);

        reservation.setStatus(Reservation.Status.CHECKED_IN);
        reservation.setOrder(savedOrder);
        Reservation saved = reservationRepository.save(reservation);

        log.info("Đón khách đặt bàn #{} → bàn {} → đơn hàng #{}",
                saved.getId(), table.getTableNumber(), savedOrder.getId());
        return ReservationResponse.fromEntity(saved);
    }

    // Đơn hàng hoàn tất (khách đã thanh toán) → đặt bàn liên kết tự COMPLETED
    @Override
    public void handleOrderCompleted(Long orderId) {
        reservationRepository.findByOrderId(orderId).ifPresent(reservation -> {
            if (reservation.getStatus() == Reservation.Status.CHECKED_IN) {
                reservation.setStatus(Reservation.Status.COMPLETED);
                reservationRepository.save(reservation);
                log.info("Đặt bàn #{} tự hoàn tất (đơn hàng #{} đã thanh toán)", reservation.getId(), orderId);
            }
        });
    }

    // Đơn hàng bị hủy/xóa → đặt bàn đang dùng bữa quay lại CONFIRMED, bỏ liên kết đơn cũ
    @Override
    public void handleOrderDiscarded(Long orderId) {
        reservationRepository.findByOrderId(orderId).ifPresent(reservation -> {
            if (reservation.getStatus() == Reservation.Status.CHECKED_IN) {
                reservation.setStatus(Reservation.Status.CONFIRMED);
                reservation.setOrder(null);
                reservationRepository.save(reservation);
                log.info("Đặt bàn #{} quay lại CONFIRMED (đơn hàng #{} bị hủy/xóa)", reservation.getId(), orderId);
            }
        });
    }

    // Đơn hàng chuyển bàn → cập nhật lại bàn trên đặt bàn
    @Override
    public void handleOrderTransferred(Long orderId, Long newTableId) {
        reservationRepository.findByOrderId(orderId).ifPresent(reservation -> {
            if (reservation.getStatus() == Reservation.Status.CHECKED_IN) {
                tableRepository.findById(newTableId).ifPresent(reservation::setTable);
                reservationRepository.save(reservation);
            }
        });
    }

    /**
     * Gán/đổi bàn cho đặt bàn sau khi kiểm sức chứa và trùng lịch.
     * Cùng bàn + cùng ngày + khung giờ ±2 tiếng = trùng lịch.
     */
    private void validateAndAssignTable(Reservation reservation, Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn"));

        if (table.getCapacity() < reservation.getGuestCount()) {
            throw new BadRequestException("Bàn " + table.getTableNumber() + " chỉ chứa được "
                    + table.getCapacity() + " người, không đủ cho " + reservation.getGuestCount() + " người");
        }

        LocalTime time = reservation.getReservationTime();
        long conflicts = reservationRepository.countConflictingReservations(
                table.getId(),
                reservation.getReservationDate(),
                time.minusHours(2),
                time.plusHours(2),
                List.of(Reservation.Status.PENDING, Reservation.Status.CONFIRMED, Reservation.Status.CHECKED_IN),
                reservation.getId());

        if (conflicts > 0) {
            throw new BadRequestException("Bàn " + table.getTableNumber()
                    + " đã có đặt bàn khác trong khung giờ gần đó, vui lòng chọn bàn khác");
        }

        reservation.setTable(table);
    }

    @Override
    public void cancelReservation(Long id, String email) {
        Reservation reservation = findById(id);

        // Customer chỉ hủy được của mình
        if (!reservation.getCustomer().getEmail().equals(email)) {
            throw new BadRequestException("Bạn không có quyền hủy đặt bàn này");
        }

        // Chỉ hủy được trước khi khách đến
        if (reservation.getStatus() != Reservation.Status.PENDING
                && reservation.getStatus() != Reservation.Status.CONFIRMED) {
            throw new BadRequestException(switch (reservation.getStatus()) {
                case CHECKED_IN -> "Bạn đã đến nhà hàng, vui lòng liên hệ nhân viên để được hỗ trợ";
                case COMPLETED  -> "Không thể hủy đặt bàn đã hoàn thành";
                case CANCELLED  -> "Đặt bàn đã bị hủy trước đó";
                case NO_SHOW    -> "Đặt bàn đã quá hạn vì khách không đến, không thể hủy";
                default -> "Không thể hủy đặt bàn này";
            });
        }

        reservation.setStatus(Reservation.Status.CANCELLED);
        reservationRepository.save(reservation);
    }

    private Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt bàn"));
    }
}
