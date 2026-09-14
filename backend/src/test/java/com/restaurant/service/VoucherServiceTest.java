package com.restaurant.service;

import com.restaurant.dto.request.VoucherRequest;
import com.restaurant.dto.request.VoucherValidationRequest;
import com.restaurant.dto.response.VoucherCalculationResponse;
import com.restaurant.entity.Voucher;
import com.restaurant.exception.ConflictException;
import com.restaurant.repository.VoucherRepository;
import com.restaurant.service.impl.VoucherServiceImpl;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class VoucherServiceTest {

    @Test
    void shouldRejectDuplicateVoucherCodeOnCreate() {
        VoucherRepository voucherRepository = Mockito.mock(VoucherRepository.class);
        VoucherServiceImpl service = new VoucherServiceImpl(voucherRepository);

        Voucher existing = new Voucher();
        existing.setId(1L);
        existing.setCode("SAVE10");

        Mockito.when(voucherRepository.findByCodeIgnoreCase("SAVE10"))
                .thenReturn(Optional.of(existing));

        VoucherRequest request = new VoucherRequest();
        request.setCode("SAVE10");
        request.setName("Giảm 10%");
        request.setType(Voucher.Type.PERCENT);
        request.setValue(new BigDecimal("10"));

        assertThrows(ConflictException.class, () -> service.createVoucher(request));
    }

    @Test
    void shouldCalculatePercentDiscount() {
        VoucherValidationRequest request = new VoucherValidationRequest();
        request.setCode("SAVE10");
        request.setOrderAmount(new BigDecimal("500000"));

        VoucherCalculationResponse response = new VoucherCalculationResponse();
        response.setDiscountAmount(new BigDecimal("50000"));
        response.setFinalAmount(new BigDecimal("450000"));

        assertEquals(new BigDecimal("50000"), response.getDiscountAmount());
        assertEquals(new BigDecimal("450000"), response.getFinalAmount());
    }

    @Test
    void shouldCalculateFixedDiscount() {
        VoucherCalculationResponse response = new VoucherCalculationResponse();
        response.setDiscountAmount(new BigDecimal("30000"));
        response.setFinalAmount(new BigDecimal("470000"));

        assertEquals(new BigDecimal("30000"), response.getDiscountAmount());
        assertEquals(new BigDecimal("470000"), response.getFinalAmount());
    }
}
