package com.example.piccolos.service;

import com.example.piccolos.dto.ReservationRequest;
import com.example.piccolos.dto.ReservationResponse;
import com.example.piccolos.entity.Reservation;
import com.example.piccolos.entity.RestaurantTable;
import com.example.piccolos.repository.ReservationRepository;
import com.example.piccolos.repository.RestaurantTableRepository;
import com.example.piccolos.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class ReservationService {

    private static final ZoneId RESTAURANT_ZONE = ZoneId.of("Asia/Colombo");
    private static final LocalTime OPEN_TIME = LocalTime.of(12, 0);
    private static final LocalTime CLOSE_TIME = LocalTime.of(23, 59);
    private static final LocalTime LAST_START_TIME = LocalTime.of(23, 30);
    private static final long DEFAULT_DURATION_MINUTES = 60;

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
            LocalTime startTime,
            LocalTime endTime,
            int partySize
    ) {
        if (partySize <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Party size must be greater than zero.");
        }
        LocalTime resolvedEnd = resolveEndTime(startTime, endTime);
        validateDateTimeRange(date, startTime, resolvedEnd);

        List<RestaurantTable> suitableTables =
                tableRepository.findByCapacityGreaterThanEqual(partySize);

        List<Integer> reservedTableIds = reservationRepository.findByReservationDate(date).stream()
                .filter(r -> !"CANCELLED".equalsIgnoreCase(r.getStatus()))
                .filter(r -> r.getRestaurantTable() != null && isOverlapping(r, startTime, resolvedEnd))
                .map(r -> r.getRestaurantTable().getId())
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

    @Transactional
    public ReservationResponse updateStatus(Integer id, String status) {
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation status is required.");
        }

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found."));

        String normalized = status.trim().toUpperCase();
        if (!List.of("PENDING", "ACKNOWLEDGED", "COMPLETED", "CANCELLED").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reservation status.");
        }

        reservation.setStatus(normalized);
        return new ReservationResponse(reservationRepository.save(reservation));
    }

    private LocalTime resolveEndTime(LocalTime startTime, LocalTime endTime) {
        if (endTime != null) {
            return endTime.equals(LocalTime.MIDNIGHT) ? CLOSE_TIME : endTime;
        }
        if (startTime == null) return null;
        LocalTime fallback = startTime.plusMinutes(DEFAULT_DURATION_MINUTES);
        return fallback.isBefore(startTime) ? CLOSE_TIME : fallback;
    }

    private boolean isOverlapping(Reservation existing, LocalTime reqStart, LocalTime reqEnd) {
        LocalTime existingStart = existing.getReservationTime();
        if (existingStart == null || reqStart == null || reqEnd == null) return false;
        LocalTime existingEnd = resolveEndTime(existingStart, existing.getEndTime());
        return existingStart.isBefore(reqEnd) && existingEnd.isAfter(reqStart);
    }

    private void validateDateTimeRange(LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (date == null || startTime == null || endTime == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date, start time, and end time are required.");
        }
        if (startTime.isBefore(OPEN_TIME) || startTime.isAfter(LAST_START_TIME)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservations are only available between 12:00 PM and 12:00 AM.");
        }
        if (startTime.getMinute() % 30 != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be in 30-minute intervals.");
        }
        if (!endTime.equals(CLOSE_TIME) && endTime.getMinute() % 30 != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be in 30-minute intervals.");
        }
        if (!endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }

        LocalDate today = LocalDate.now(RESTAURANT_ZONE);
        LocalTime now = LocalTime.now(RESTAURANT_ZONE);
        if (date.isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation date cannot be in the past.");
        }
        if (date.equals(today) && startTime.isBefore(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation time cannot be in the past.");
        }
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

        LocalTime resolvedEnd = resolveEndTime(request.getReservationTime(), request.getEndTime());
        request.setEndTime(resolvedEnd);
        validateDateTimeRange(request.getReservationDate(), request.getReservationTime(), resolvedEnd);
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

        boolean alreadyReserved = reservationRepository.findByReservationDate(request.getReservationDate()).stream()
                .filter(r -> !"CANCELLED".equalsIgnoreCase(r.getStatus()))
                .filter(r -> r.getRestaurantTable() != null && r.getRestaurantTable().getId().equals(table.getId()))
                .filter(r -> excludedReservationId == null || !r.getId().equals(excludedReservationId))
                .anyMatch(r -> isOverlapping(r, request.getReservationTime(), request.getEndTime()));

        if (alreadyReserved) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This table is already reserved during the selected time slot."
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
        reservation.setEndTime(request.getEndTime());
        reservation.setRestaurantTable(table);
        reservation.setNotes(
                request.getNotes() != null && !request.getNotes().isBlank()
                        ? request.getNotes().trim()
                        : null
        );

        if (request.getUserId() != null) {
            reservation.setUser(userRepository.findById(request.getUserId()).orElse(null));
        } else {
            reservation.setUser(null);
        }
    }
}