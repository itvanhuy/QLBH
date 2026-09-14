package com.restaurant.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Wrapper cho response có phân trang.
 *
 * Format:
 * {
 *   "content": [...],
 *   "pageNumber": 0,
 *   "pageSize": 20,
 *   "totalElements": 100,
 *   "totalPages": 5,
 *   "last": false
 * }
 */
@Getter
@Builder
public class PageResponse<T> {

    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;

    /** Tạo PageResponse từ Spring Page object */
    public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
