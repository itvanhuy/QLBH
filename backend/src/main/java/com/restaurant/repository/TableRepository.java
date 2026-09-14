package com.restaurant.repository;

import com.restaurant.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<RestaurantTable, Long> {

    // Kiểm tra số bàn đã tồn tại chưa
    boolean existsByTableNumber(String tableNumber);

    // Kiểm tra số bàn tồn tại nhưng khác ID (khi update)
    boolean existsByTableNumberAndIdNot(String tableNumber, Long id);

    // Tìm bàn theo số bàn
    Optional<RestaurantTable> findByTableNumber(String tableNumber);

    // Lấy danh sách bàn theo status
    List<RestaurantTable> findByStatus(RestaurantTable.Status status);

    // Đếm bàn theo status - dùng cho dashboard
    long countByStatus(RestaurantTable.Status status);
}
