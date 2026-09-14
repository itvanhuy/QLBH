package com.restaurant.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

/**
 * Wrapper chung cho tất cả API response thành công.
 *
 * Format thống nhất:
 * {
 *   "success": true,
 *   "message": "Thao tác thành công",
 *   "data": { ... }   // null nếu không có data
 * }
 *
 * @param <T> kiểu dữ liệu trong field data
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // Không trả field null
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    // ── Static factory methods ──────────────────────────────

    /** Thành công kèm data */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    /** Thành công không có data (VD: xóa, khóa tài khoản) */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }

    /** Lỗi (dùng khi cần trả lỗi tùy chỉnh ngoài GlobalExceptionHandler) */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
