package com.restaurant.repository;

import com.restaurant.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    Optional<Voucher> findByCodeIgnoreCaseAndIsActiveTrue(String code);

    List<Voucher> findAllByOrderByCreatedAtDesc();
}
