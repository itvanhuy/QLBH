package com.restaurant.controller;

import com.restaurant.dto.request.TableRequest;
import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.TableResponse;
import com.restaurant.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * GET    /api/tables               - Public
 * GET    /api/tables/{id}          - Public
 * POST   /api/tables               - ADMIN, STAFF
 * PUT    /api/tables/{id}          - ADMIN, STAFF
 * DELETE /api/tables/{id}          - ADMIN
 * PATCH  /api/tables/{id}/status   - ADMIN, STAFF
 */
@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bàn thành công",
                tableService.getAllTables()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> getTableById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin bàn thành công",
                tableService.getTableById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(
            @Valid @RequestBody TableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm bàn thành công",
                        tableService.createTable(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bàn thành công",
                tableService.updateTable(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bàn thành công"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<TableResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái bàn thành công",
                tableService.updateTableStatus(id, body.get("status"))));
    }
}
