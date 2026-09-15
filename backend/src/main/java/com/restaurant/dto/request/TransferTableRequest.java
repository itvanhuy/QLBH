package com.restaurant.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransferTableRequest {

    @NotNull(message = "ID bàn mới không được để trống")
    private Long tableId;
}