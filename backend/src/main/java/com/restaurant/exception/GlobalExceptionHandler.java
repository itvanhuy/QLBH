package com.restaurant.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Xử lý tất cả exception tập trung.
 *
 * @RestControllerAdvice: áp dụng cho tất cả @RestController
 * @Slf4j: Lombok tự tạo logger
 *
 * Mọi lỗi đều trả về cùng format JSON:
 * {
 *   "status": 404,
 *   "message": "Không tìm thấy món ăn",
 *   "timestamp": "2026-09-11T10:00:00",
 *   "path": "/api/products/99"
 * }
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ====================================================
    // 404 - Không tìm thấy resource
    // ====================================================
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    // ====================================================
    // 400 - Request không hợp lệ (business logic)
    // ====================================================
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {
        log.warn("Bad request: {}", ex.getMessage());
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    // ====================================================
    // 409 - Xung đột dữ liệu
    // ====================================================
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(
            ConflictException ex, HttpServletRequest request) {
        log.warn("Conflict: {}", ex.getMessage());
        return buildError(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
    }

    // ====================================================
    // 401 - Chưa xác thực
    // ====================================================
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex, HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI());
    }

    // ====================================================
    // 401 - Sai credential (email/password)
    // ====================================================
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng", request.getRequestURI());
    }

    // ====================================================
    // 403 - Không có quyền
    // ====================================================
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        return buildError(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này", request.getRequestURI());
    }

    // ====================================================
    // 400 - Validation lỗi (@Valid trong request body)
    // Trả về danh sách lỗi cho từng field
    // ====================================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        ValidationErrorResponse response = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Dữ liệu không hợp lệ",
                LocalDateTime.now(),
                request.getRequestURI(),
                fieldErrors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ====================================================
    // 500 - Lỗi không xác định (bắt hết)
    // ====================================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(
            Exception ex, HttpServletRequest request) {
        // Log đầy đủ stack trace ở server, KHÔNG gửi cho client
        log.error("Unexpected error at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR,
                "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
                request.getRequestURI());
    }

    // ====================================================
    // Helper: tạo ErrorResponse
    // ====================================================
    private ResponseEntity<ErrorResponse> buildError(HttpStatus status, String message, String path) {
        ErrorResponse body = new ErrorResponse(status.value(), message, LocalDateTime.now(), path);
        return ResponseEntity.status(status).body(body);
    }

    // ====================================================
    // Inner classes - Response structure
    // ====================================================

    /**
     * Cấu trúc response lỗi chuẩn
     */
    public record ErrorResponse(
            int status,
            String message,
            LocalDateTime timestamp,
            String path
    ) {}

    /**
     * Cấu trúc response lỗi validation (có thêm fieldErrors)
     */
    public record ValidationErrorResponse(
            int status,
            String message,
            LocalDateTime timestamp,
            String path,
            Map<String, String> errors
    ) {}
}
