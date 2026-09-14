package com.restaurant.service.impl;

import com.restaurant.dto.request.TableRequest;
import com.restaurant.dto.response.TableResponse;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ConflictException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.TableRepository;
import com.restaurant.service.TableService;
import com.restaurant.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TableServiceImpl implements TableService {

    private final TableRepository tableRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        return tableRepository.findAll()
                .stream()
                .map(TableResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        return TableResponse.fromEntity(findById(id));
    }

    @Override
    public TableResponse createTable(TableRequest request) {
        if (tableRepository.existsByTableNumber(request.getTableNumber())) {
            throw new ConflictException(AppConstants.TABLE_NUMBER_EXISTS);
        }

        RestaurantTable table = RestaurantTable.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .status(RestaurantTable.Status.AVAILABLE)
                .build();

        return TableResponse.fromEntity(tableRepository.save(table));
    }

    @Override
    public TableResponse updateTable(Long id, TableRequest request) {
        RestaurantTable table = findById(id);

        if (tableRepository.existsByTableNumberAndIdNot(request.getTableNumber(), id)) {
            throw new ConflictException(AppConstants.TABLE_NUMBER_EXISTS);
        }

        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());

        if (StringUtils.hasText(request.getStatus())) {
            table.setStatus(parseStatus(request.getStatus()));
        }

        return TableResponse.fromEntity(tableRepository.save(table));
    }

    @Override
    public void deleteTable(Long id) {
        RestaurantTable table = findById(id);
        if (table.getStatus() == RestaurantTable.Status.OCCUPIED) {
            throw new BadRequestException("Không thể xóa bàn đang có khách");
        }
        tableRepository.deleteById(id);
    }

    @Override
    public TableResponse updateTableStatus(Long id, String status) {
        RestaurantTable table = findById(id);
        table.setStatus(parseStatus(status));
        return TableResponse.fromEntity(tableRepository.save(table));
    }

    private RestaurantTable findById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.TABLE_NOT_FOUND));
    }

    private RestaurantTable.Status parseStatus(String status) {
        try {
            return RestaurantTable.Status.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái bàn không hợp lệ: " + status);
        }
    }
}
