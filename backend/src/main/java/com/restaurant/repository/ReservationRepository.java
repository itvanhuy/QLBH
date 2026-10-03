package com.restaurant.repository;

import com.restaurant.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Đặt bàn của một customer
    Page<Reservation> findByCustomerIdOrderByReservationDateDesc(Long customerId, Pageable pageable);

    // Tất cả đặt bàn theo ngày (Admin/Staff xem lịch)
    List<Reservation> findByReservationDateOrderByReservationTimeAsc(LocalDate date);

    // Tất cả đặt bàn với filter
    @Query("SELECT r FROM Reservation r WHERE " +
           "(:status IS NULL OR r.status = :status) " +
           "AND (:date IS NULL OR r.reservationDate = :date) " +
           "ORDER BY r.reservationDate DESC, r.reservationTime ASC")
    Page<Reservation> searchReservations(
            @Param("status") Reservation.Status status,
            @Param("date")   LocalDate date,
            Pageable pageable);

    // Đếm đặt bàn chờ xác nhận
    long countByStatus(Reservation.Status status);

    // Tìm đặt bàn theo đơn hàng phát sinh (đồng bộ khi đơn hoàn tất/hủy)
    Optional<Reservation> findByOrderId(Long orderId);

    // Đếm đặt bàn khác trùng bàn + trùng ngày trong khung giờ [fromTime, toTime]
    @Query("SELECT COUNT(r) FROM Reservation r WHERE " +
           "r.table.id = :tableId " +
           "AND r.reservationDate = :date " +
           "AND r.id <> :excludeId " +
           "AND r.status IN :statuses " +
           "AND r.reservationTime BETWEEN :fromTime AND :toTime")
    long countConflictingReservations(
            @Param("tableId")  Long tableId,
            @Param("date")     LocalDate date,
            @Param("fromTime") LocalTime fromTime,
            @Param("toTime")   LocalTime toTime,
            @Param("statuses") Collection<Reservation.Status> statuses,
            @Param("excludeId") Long excludeId);
}
