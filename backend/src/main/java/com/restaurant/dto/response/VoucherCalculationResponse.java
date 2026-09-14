package com.restaurant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherCalculationResponse {
    private String code;
    private String name;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String type;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
}
