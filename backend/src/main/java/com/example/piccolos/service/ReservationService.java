package com.example.piccolos.service;

import com.example.piccolos.dto.ReservationRequest;
import com.example.piccolos.dto.ReservationResponse;
import com.example.piccolos.entity.Reservation;
import com.example.piccolos.entity.RestaurantTable;
import com.example.piccolos.repository.ReservationRepository;
import com.example.piccolos.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            RestaurantTableRepository tableRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
    }

    public List<RestaurantTable> getAvailableTables(
            LocalDate date,
            LocalTime time,
            int partySize
    ) {
        if (partySize <= 0) {
            throw new RuntimeException("Party size must be greater than zero.");
        }

        List<RestaurantTable> suitableTables =
                tableRepository.findByCapacityGreaterThanEqual(partySize);

        List<Reservation> existingReservations =
                reservationRepository.findByReservationDateAndReservationTime(
                        date,
                        time
                );

        List<Integer> reservedTableIds = existingReservations.stream()
                .map(r -> r.getRestaurantTable().getId())
                .toList();

        List<RestaurantTable> availableTables = new ArrayList<>();

        for (RestaurantTable table : suitableTables) {
            if (!reservedTableIds.contains(table.getId())) {
                availableTables.add(table);
            }
        }

        return availableTables;
    }

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {

        if (request.getGuestName() == null || request.getGuestName().isBlank()) {
            throw new RuntimeException("Guest name is required.");
        }

        if (request.getGuestPhone() == null || request.getGuestPhone().isBlank()) {
            throw new RuntimeException("Guest phone is required.");
        }

        if (request.getTableId() == null) {
            throw new RuntimeException("Please select a table.");
        }

        if (request.getPartySize() == null || request.getPartySize() <= 0) {
            throw new RuntimeException("Invalid party size.");
        }

        if (request.getReservationDate() == null ||
                request.getReservationTime() == null) {
            throw new RuntimeException("Date and time are required.");
        }

        /*
         * Lock the selected table while we check the reservation.
         * This helps prevent two booking requests from reserving
         * the same table at the same time.
         */
        RestaurantTable table = tableRepository
                .findByIdForUpdate(request.getTableId())
                .orElseThrow(() ->
                        new RuntimeException("Selected table does not exist.")
                );

        if (table.getCapacity() < request.getPartySize()) {
            throw new RuntimeException(
                    "Selected table cannot accommodate " +
                            request.getPartySize() + " guests."
            );
        }

        boolean alreadyReserved =
                reservationRepository
                        .findByRestaurantTableIdAndReservationDateAndReservationTime(
                                request.getTableId(),
                                request.getReservationDate(),
                                request.getReservationTime()
                        )
                        .isPresent();

        if (alreadyReserved) {
            throw new RuntimeException(
                    "This table is already reserved for the selected time."
            );
        }

        Reservation reservation = new Reservation();

        reservation.setGuestName(request.getGuestName());
        reservation.setGuestPhone(request.getGuestPhone());
        reservation.setReservationDate(request.getReservationDate());
        reservation.setReservationTime(request.getReservationTime());
        reservation.setRestaurantTable(table);

        /*
         * userId is optional because the database design allows
         * walk-in/guest reservations.
         *
         * Registered-user linking can be connected to JWT later.
         */

        Reservation savedReservation =
                reservationRepository.save(reservation);

        return new ReservationResponse(savedReservation);
    }

    public List<Reservation> getReservationsByDate(LocalDate date) {
        return reservationRepository.findByReservationDate(date);
    }

    public long getUserReservationCount(Integer userId) {
        return reservationRepository.countByUserId(userId);
    }

    public ReservationResponse getReservation(Integer id) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Reservation not found.")
                );

        return new ReservationResponse(reservation);
    }

    public void cancelReservation(Integer id) {

        if (!reservationRepository.existsById(id)) {
            throw new RuntimeException("Reservation not found.");
        }

        reservationRepository.deleteById(id);
    }
}