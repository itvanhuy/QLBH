package com.restaurant.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ReservationRequest {

    @NotNull(message = "Số người không được để trống")
    @Min(value = 1, message = "Số người ít nhất là 1")
    @Max(value = 20, message = "Số người tối đa là 20")
    private Integer guestCount;

    @NotNull(message = "Ngày đặt không được để trống")
    private String reservationDate; // "2026-10-05"

    @NotBlank(message = "Giờ đặt không được để trống")
    private String reservationTime; // "18:00"

    private String note;
}
