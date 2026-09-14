package com.restaurant.dto.request;

import com.restaurant.entity.Voucher;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class VoucherRequest {

    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotBlank(message = "Tên mã giảm giá không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Loại mã giảm giá không được để trống")
    private Voucher.Type type;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
    private BigDecimal value;

    @DecimalMin(value = "0.00", message = "Giá trị tối thiểu đơn hàng không hợp lệ")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Mức giảm tối đa không hợp lệ")
    private BigDecimal maxDiscountAmount;

    private Boolean isActive = true;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer usageLimit = 0;
}
