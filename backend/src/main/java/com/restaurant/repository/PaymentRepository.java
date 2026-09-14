package com.restaurant.repository;

import com.restaurant.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Tìm payment theo order - quan hệ 1:1
    Optional<Payment> findByOrderId(Long orderId);

    // Kiểm tra order đã có payment chưa
    boolean existsByOrderId(Long orderId);
}
