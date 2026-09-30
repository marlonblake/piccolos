package com.example.piccolos.controller;

import com.example.piccolos.dto.ReservationRequest;
import com.example.piccolos.dto.ReservationResponse;
import com.example.piccolos.entity.Reservation;
import com.example.piccolos.entity.RestaurantTable;
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
    public ResponseEntity<?> getAvailability(
            @RequestParam LocalDate date,
            @RequestParam LocalTime time,
            @RequestParam int partySize
    ) {
        try {
            List<RestaurantTable> tables =
                    reservationService.getAvailableTables(
                            date,
                            time,
                            partySize
                    );

            return ResponseEntity.ok(tables);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createReservation(
            @RequestBody ReservationRequest request
    ) {
        try {

            ReservationResponse response =
                    reservationService.createReservation(request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReservation(
            @PathVariable Integer id
    ) {
        try {

            return ResponseEntity.ok(
                    reservationService.getReservation(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Reservation>> getReservationsByDate(
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
    public ResponseEntity<?> cancelReservation(
            @PathVariable Integer id
    ) {
        try {

            reservationService.cancelReservation(id);

            return ResponseEntity.ok(
                    "Reservation cancelled successfully."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}