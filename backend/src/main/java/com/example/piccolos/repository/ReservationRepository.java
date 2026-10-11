package com.example.piccolos.repository;

import com.example.piccolos.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    List<Reservation> findByReservationDate(LocalDate reservationDate);

    List<Reservation> findByReservationDateAndReservationTime(
            LocalDate reservationDate,
            LocalTime reservationTime
    );

    long countByUserId(Integer userId);

    List<Reservation> findByUserId(Integer userId);

    Optional<Reservation> findByRestaurantTableIdAndReservationDateAndReservationTime(
            Integer tableId,
            LocalDate reservationDate,
            LocalTime reservationTime
    );
}