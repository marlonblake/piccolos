package com.example.piccolos.service;

import com.example.piccolos.dto.ReservationRequest;
import com.example.piccolos.dto.ReservationResponse;
import com.example.piccolos.entity.Reservation;
import com.example.piccolos.entity.RestaurantTable;
import com.example.piccolos.entity.User;
import com.example.piccolos.repository.ReservationRepository;
import com.example.piccolos.repository.RestaurantTableRepository;
import com.example.piccolos.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserRepository userRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            RestaurantTableRepository tableRepository,
            UserRepository userRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
        this.userRepository = userRepository;
    }

    public List<RestaurantTable> getAvailableTables(
            LocalDate date,
            LocalTime time,
            int partySize
    ) {
        if (partySize <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Party size must be greater than zero.");
        }
        if (date == null || time == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date and time are required.");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation date cannot be in the past.");
        }
        if (date.equals(LocalDate.now()) && time.isBefore(LocalTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation time cannot be in the past.");
        }

        List<RestaurantTable> suitableTables =
                tableRepository.findByCapacityGreaterThanEqual(partySize);

        List<Reservation> existingReservations =
                reservationRepository.findByReservationDateAndReservationTime(
                        date,
                        time
                );

        List<Integer> reservedTableIds = existingReservations.stream()
                .map(Reservation::getRestaurantTable)
                .filter(table -> table != null)
                .map(RestaurantTable::getId)
                .toList();

        return suitableTables.stream()
                .filter(table -> !reservedTableIds.contains(table.getId()))
                .toList();
    }

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        validateRequest(request);
        RestaurantTable table = getBookableTable(request, null);
        Reservation reservation = new Reservation();
        applyRequest(reservation, request, table);
        return new ReservationResponse(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationResponse updateReservation(Integer id, ReservationRequest request) {
        validateRequest(request);
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found."));
        RestaurantTable table = getBookableTable(request, id);

        applyRequest(reservation, request, table);
        return new ReservationResponse(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservations() {
        return reservationRepository.findAllByOrderByReservationDateAscReservationTimeAsc().stream()
                .map(ReservationResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByDate(LocalDate date) {
        return reservationRepository.findAllByReservationDateOrderByReservationTimeAsc(date).stream()
                .map(ReservationResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUserReservationCount(Integer userId) {
        return reservationRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservation(Integer id) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found."));

        return new ReservationResponse(reservation);
    }

    @Transactional
    public void cancelReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found."));
        reservationRepository.delete(reservation);
    }

    private void validateRequest(ReservationRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation details are required.");
        }
        if (request.getGuestName() == null || request.getGuestName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest name is required.");
        }
        if (request.getGuestPhone() == null || request.getGuestPhone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest phone is required.");
        }
        if (request.getTableId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select a table.");
        }
        if (request.getPartySize() == null || request.getPartySize() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid party size.");
        }
        if (request.getReservationDate() == null || request.getReservationTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date and time are required.");
        }
        if (request.getReservationDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation date cannot be in the past.");
        }
        if (request.getReservationDate().equals(LocalDate.now())
                && request.getReservationTime().isBefore(LocalTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation time cannot be in the past.");
        }
    }

    private RestaurantTable getBookableTable(ReservationRequest request, Integer excludedReservationId) {
        RestaurantTable table = tableRepository.findByIdForUpdate(request.getTableId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Selected table does not exist."));

        if (table.getCapacity() < request.getPartySize()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected table cannot accommodate " + request.getPartySize() + " guests."
            );
        }
        boolean alreadyReserved = excludedReservationId == null
                ? reservationRepository.findByRestaurantTableIdAndReservationDateAndReservationTime(
                        table.getId(), request.getReservationDate(), request.getReservationTime()).isPresent()
                : reservationRepository.existsByRestaurantTableIdAndReservationDateAndReservationTimeAndIdNot(
                        table.getId(), request.getReservationDate(), request.getReservationTime(), excludedReservationId);
        if (alreadyReserved) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This table is already reserved for the selected time."
            );
        }
        return table;
    }

    private void applyRequest(Reservation reservation, ReservationRequest request, RestaurantTable table) {
        reservation.setGuestName(request.getGuestName().trim());
        reservation.setGuestPhone(request.getGuestPhone().trim());
        reservation.setPartySize(request.getPartySize());
        reservation.setReservationDate(request.getReservationDate());
        reservation.setReservationTime(request.getReservationTime());
        reservation.setRestaurantTable(table);

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found."));
            reservation.setUser(user);
        }
    }
}