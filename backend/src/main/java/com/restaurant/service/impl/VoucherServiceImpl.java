package com.restaurant.service.impl;

import com.restaurant.dto.request.VoucherRequest;
import com.restaurant.dto.request.VoucherValidationRequest;
import com.restaurant.dto.response.VoucherCalculationResponse;
import com.restaurant.dto.response.VoucherResponse;
import com.restaurant.entity.Voucher;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ConflictException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.VoucherRepository;
import com.restaurant.service.VoucherService;
import com.restaurant.util.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(VoucherResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Long id) {
        return VoucherResponse.fromEntity(findById(id));
    }

    @Override
    public VoucherResponse createVoucher(VoucherRequest request) {
        validateVoucherRequest(request, null);

        Voucher voucher = Voucher.builder()
                .code(normalizeCode(request.getCode()))
                .name(request.getName().trim())
                .description(request.getDescription())
                .type(request.getType())
                .value(request.getValue())
                .minOrderAmount(request.getMinOrderAmount() == null ? BigDecimal.ZERO : request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .isActive(request.getIsActive() == null || request.getIsActive())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .usageLimit(request.getUsageLimit() == null ? 0 : request.getUsageLimit())
                .build();

        Voucher saved = voucherRepository.save(voucher);
        log.info("Tạo voucher mới: {}", saved.getCode());
        return VoucherResponse.fromEntity(saved);
    }

    @Override
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = findById(id);
        validateVoucherRequest(request, voucher.getId());

        voucher.setCode(normalizeCode(request.getCode()));
        voucher.setName(request.getName().trim());
        voucher.setDescription(request.getDescription());
        voucher.setType(request.getType());
        voucher.setValue(request.getValue());
        voucher.setMinOrderAmount(request.getMinOrderAmount() == null ? BigDecimal.ZERO : request.getMinOrderAmount());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setIsActive(request.getIsActive() == null || request.getIsActive());
        voucher.setStartAt(request.getStartAt());
        voucher.setEndAt(request.getEndAt());
        voucher.setUsageLimit(request.getUsageLimit() == null ? 0 : request.getUsageLimit());

        return VoucherResponse.fromEntity(voucherRepository.save(voucher));
    }

    @Override
    public void deleteVoucher(Long id) {
        Voucher voucher = findById(id);
        voucherRepository.delete(voucher);
    }

    @Override
    public VoucherCalculationResponse validateAndCalculate(VoucherValidationRequest request) {
        var voucher = voucherRepository.findByCodeIgnoreCaseAndIsActiveTrue(request.getCode())
                .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa"));

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartAt() != null && now.isBefore(voucher.getStartAt())) {
            throw new BadRequestException("Mã giảm giá chưa bắt đầu áp dụng");
        }

        if (voucher.getEndAt() != null && now.isAfter(voucher.getEndAt())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsageLimit() > 0
                && voucher.getUsedCount() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
        }

        if (request.getOrderAmount().compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new BadRequestException(
                    "Đơn hàng tối thiểu phải từ " + voucher.getMinOrderAmount().setScale(0, RoundingMode.HALF_UP) + " VNĐ");
        }

        BigDecimal discountAmount = calculateDiscount(voucher, request.getOrderAmount());
        BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);

        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        return VoucherCalculationResponse.builder()
                .code(voucher.getCode())
                .name(voucher.getName())
                .discountAmount(discountAmount.setScale(2, RoundingMode.HALF_UP))
                .finalAmount(finalAmount.setScale(2, RoundingMode.HALF_UP))
                .type(voucher.getType().name())
                .minOrderAmount(voucher.getMinOrderAmount())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .build();
    }

    private BigDecimal calculateDiscount(Voucher voucher, BigDecimal orderAmount) {
        BigDecimal discountAmount;

        if (voucher.getType() == Voucher.Type.PERCENT) {
            discountAmount = orderAmount.multiply(voucher.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discountAmount = voucher.getMaxDiscountAmount();
            }
        } else {
            discountAmount = voucher.getValue();
            if (discountAmount.compareTo(orderAmount) > 0) {
                discountAmount = orderAmount;
            }
        }

        return discountAmount;
    }

    private Voucher findById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá"));
    }

    private void validateVoucherRequest(VoucherRequest request, Long ignoreId) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new BadRequestException("Mã giảm giá không được để trống");
        }

        String normalized = normalizeCode(request.getCode());
        voucherRepository.findByCodeIgnoreCase(normalized)
                .ifPresent(existing -> {
                    if (ignoreId == null || !existing.getId().equals(ignoreId)) {
                        throw new ConflictException("Mã giảm giá đã tồn tại");
                    }
                });

        if (request.getType() == null) {
            throw new BadRequestException("Loại mã giảm giá không được để trống");
        }

        if (request.getValue() == null || request.getValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Giá trị giảm phải lớn hơn 0");
        }

        if (request.getType() == Voucher.Type.PERCENT && request.getValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Phần trăm giảm tối đa là 100%");
        }

        if (request.getMinOrderAmount() != null && request.getMinOrderAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Đơn hàng tối thiểu không hợp lệ");
        }

        if (request.getMaxDiscountAmount() != null && request.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Mức giảm tối đa không hợp lệ");
        }

        if (request.getStartAt() != null && request.getEndAt() != null && request.getStartAt().isAfter(request.getEndAt())) {
            throw new BadRequestException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase();
    }
}
