package com.restaurant.controller;

import com.restaurant.dto.request.ReservationRequest;
import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.dto.response.ReservationResponse;
import com.restaurant.entity.Reservation;
import com.restaurant.entity.User;
import com.restaurant.exception.UnauthorizedException;
import com.restaurant.repository.UserRepository;
import com.restaurant.service.ReservationService;
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
 * POST   /api/reservations              - Customer: tạo đặt bàn
 * GET    /api/reservations/my           - Customer: xem đặt bàn của mình
 * GET    /api/reservations              - Admin/Staff: tất cả đặt bàn
 * GET    /api/reservations/{id}         - Chi tiết
 * PATCH  /api/reservations/{id}/status  - Admin/Staff: xác nhận / hủy / đánh dấu không đến
 * POST   /api/reservations/{id}/check-in - Admin/Staff: đón khách (chiếm bàn + tự tạo đơn hàng)
 * DELETE /api/reservations/{id}         - Customer: hủy của mình
 */
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;

    // Customer tạo đặt bàn
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReservationResponse>> create(
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đặt bàn thành công, vui lòng chờ xác nhận",
                        reservationService.createReservation(request, userDetails.getUsername())));
    }

    // Customer xem đặt bàn của mình
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<ReservationResponse>>> getMyReservations(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đặt bàn thành công",
                reservationService.getMyReservations(userDetails.getUsername(), page, size)));
    }

    // Admin/Staff xem tất cả
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<ReservationResponse>>> getAll(
            @RequestParam(required = false) Reservation.Status status,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đặt bàn thành công",
                reservationService.getAllReservations(status, date, page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReservationResponse>> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        ReservationResponse response = reservationService.getById(id);

        // Customer chỉ được xem đặt bàn của mình
        boolean isCustomer = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(new SimpleGrantedAuthority("ROLE_CUSTOMER").getAuthority()));

        if (isCustomer) {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new UnauthorizedException("Vui lòng đăng nhập lại"));
            Long reservationCustomerId = response.getCustomerId();
            if (reservationCustomerId == null || !reservationCustomerId.equals(currentUser.getId())) {
                throw new UnauthorizedException("Bạn không có quyền xem đặt bàn này");
            }
        }

        return ResponseEntity.ok(ApiResponse.success("OK", response));
    }

    // Admin/Staff cập nhật trạng thái + gán bàn
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String status  = (String) body.get("status");
        Long tableId = body.get("tableId") != null
                ? Long.parseLong(body.get("tableId").toString()) : null;
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công",
                reservationService.updateStatus(id, status, tableId)));
    }

    // Admin/Staff đón khách: chiếm bàn + tự tạo đơn hàng gắn với đặt bàn
    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ReservationResponse>> checkIn(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long tableId = (body != null && body.get("tableId") != null)
                ? Long.parseLong(body.get("tableId").toString()) : null;
        return ResponseEntity.ok(ApiResponse.success("Đã đón khách và tạo đơn hàng",
                reservationService.checkIn(id, tableId, userDetails.getUsername())));
    }

    // Customer hủy đặt bàn
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        reservationService.cancelReservation(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Hủy đặt bàn thành công"));
    }
}
