package com.restaurant.service;

import com.restaurant.dto.request.VoucherRequest;
import com.restaurant.dto.request.VoucherValidationRequest;
import com.restaurant.dto.response.VoucherCalculationResponse;
import com.restaurant.dto.response.VoucherResponse;

import java.util.List;

public interface VoucherService {
    List<VoucherResponse> getAllVouchers();
    VoucherResponse getVoucherById(Long id);
    VoucherResponse createVoucher(VoucherRequest request);
    VoucherResponse updateVoucher(Long id, VoucherRequest request);
    void deleteVoucher(Long id);
    VoucherCalculationResponse validateAndCalculate(VoucherValidationRequest request);
}
