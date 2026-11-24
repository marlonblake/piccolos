package com.example.piccolos.controller;

import com.example.piccolos.dto.ReservationRequest;
import com.example.piccolos.dto.ReservationResponse;
import com.example.piccolos.dto.RestaurantTableResponse;
import com.example.piccolos.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "http://localhost:5173")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/availability")
    public ResponseEntity<List<RestaurantTableResponse>> getAvailability(
            @RequestParam LocalDate date,
            @RequestParam LocalTime time,
            @RequestParam int partySize
    ) {
        List<RestaurantTableResponse> tables = reservationService.getAvailableTables(date, time, partySize)
                .stream()
                .map(RestaurantTableResponse::new)
                .toList();
        return ResponseEntity.ok(tables);
    }

    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(
            @RequestBody ReservationRequest request
    ) {
        return ResponseEntity.ok(reservationService.createReservation(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservation(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(reservationService.getReservation(id));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ReservationResponse>> getReservationsByDate(
            @PathVariable LocalDate date
    ) {
        return ResponseEntity.ok(
                reservationService.getReservationsByDate(date)
        );
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUserReservationCount(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(
                reservationService.getUserReservationCount(userId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelReservation(
            @PathVariable Integer id
    ) {
        reservationService.cancelReservation(id);
        return ResponseEntity.ok("Reservation cancelled successfully.");
    }
}