package com.restaurant.repository;

import com.restaurant.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Kiểm tra tên danh mục đã tồn tại chưa (tránh trùng)
    boolean existsByName(String name);

    // Tìm category theo tên
    Optional<Category> findByName(String name);

    // Kiểm tra tên đã tồn tại nhưng khác ID (dùng khi update)
    boolean existsByNameAndIdNot(String name, Long id);
}
