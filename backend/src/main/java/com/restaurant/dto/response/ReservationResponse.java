package com.restaurant.dto.response;

import com.restaurant.entity.Reservation;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
public class ReservationResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long tableId;
    private String tableNumber;
    private Long orderId;
    private Integer guestCount;
    private String reservationDate;
    private String reservationTime;
    private String note;
    private String status;
    private LocalDateTime createdAt;

    public static ReservationResponse fromEntity(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .customerId(r.getCustomer().getId())
                .customerName(r.getCustomer().getName())
                .customerPhone(r.getCustomer().getPhone())
                .tableId(r.getTable() != null ? r.getTable().getId() : null)
                .tableNumber(r.getTable() != null ? r.getTable().getTableNumber() : null)
                .orderId(r.getOrder() != null ? r.getOrder().getId() : null)
                .guestCount(r.getGuestCount())
                .reservationDate(r.getReservationDate().toString())
                .reservationTime(r.getReservationTime().toString())
                .note(r.getNote())
                .status(r.getStatus().name())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
