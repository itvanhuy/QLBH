package com.restaurant.service;

import com.restaurant.dto.request.ReservationRequest;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.dto.response.ReservationResponse;
import com.restaurant.entity.Reservation;

public interface ReservationService {
    ReservationResponse createReservation(ReservationRequest request, String customerEmail);
    PageResponse<ReservationResponse> getMyReservations(String email, int page, int size);
    PageResponse<ReservationResponse> getAllReservations(Reservation.Status status, String date, int page, int size);
    ReservationResponse getById(Long id);
    ReservationResponse updateStatus(Long id, String status, Long tableId);

    // Khách đến nhà hàng: chiếm bàn + tự tạo đơn hàng, đặt bàn → CHECKED_IN
    ReservationResponse checkIn(Long id, Long tableId, String staffEmail);

    // Đơn hàng hoàn tất (thanh toán) → đặt bàn liên kết tự COMPLETED
    void handleOrderCompleted(Long orderId);

    // Đơn hàng bị hủy/xóa → đặt bàn CHECKED_IN quay lại CONFIRMED
    void handleOrderDiscarded(Long orderId);

    // Đơn hàng chuyển bàn → cập nhật lại bàn trên đặt bàn
    void handleOrderTransferred(Long orderId, Long newTableId);

    void cancelReservation(Long id, String email);
}
