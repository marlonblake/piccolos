package com.example.piccolos.controller;

import com.example.piccolos.dto.ReservationRequest;
import com.example.piccolos.dto.ReservationResponse;
import com.example.piccolos.dto.RestaurantTableRequest;
import com.example.piccolos.dto.RestaurantTableResponse;
import com.example.piccolos.repository.AdminRepository;
import com.example.piccolos.repository.UserRepository;
import com.example.piccolos.service.ReservationService;
import com.example.piccolos.service.RestaurantTableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final RestaurantTableService tableService;
    private final ReservationService reservationService;

    public AdminController(
            AdminRepository adminRepository,
            UserRepository userRepository,
            JdbcTemplate jdbcTemplate,
            RestaurantTableService tableService,
            ReservationService reservationService
    ) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.tableService = tableService;
        this.reservationService = reservationService;
    }

    @GetMapping("/tables")
    public ResponseEntity<List<RestaurantTableResponse>> getTables() {
        return ResponseEntity.ok(tableService.getTables());
    }

    @GetMapping("/tables/{id}")
    public ResponseEntity<RestaurantTableResponse> getTable(@PathVariable Integer id) {
        return ResponseEntity.ok(tableService.getTable(id));
    }

    @PostMapping("/tables")
    public ResponseEntity<RestaurantTableResponse> createTable(
            @Valid @RequestBody RestaurantTableRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tableService.createTable(request));
    }

    @PutMapping("/tables/{id}")
    public ResponseEntity<RestaurantTableResponse> updateTable(
            @PathVariable Integer id,
            @Valid @RequestBody RestaurantTableRequest request
    ) {
        return ResponseEntity.ok(tableService.updateTable(id, request));
    }

    @DeleteMapping("/tables/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Integer id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationResponse>> getReservations(
            @RequestParam(required = false) LocalDate date
    ) {
        List<ReservationResponse> reservations = date == null
                ? reservationService.getReservations()
                : reservationService.getReservationsByDate(date);
        return ResponseEntity.ok(reservations);
    }

    @PostMapping("/reservations")
    public ResponseEntity<ReservationResponse> createReservation(
            @RequestBody ReservationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createReservation(request));
    }

    @PutMapping("/reservations/{id}")
    public ResponseEntity<ReservationResponse> updateReservation(
            @PathVariable Integer id,
            @RequestBody ReservationRequest request
    ) {
        return ResponseEntity.ok(reservationService.updateReservation(id, request));
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Integer id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reservations/{id}/status")
    public ResponseEntity<ReservationResponse> updateReservationStatus(
            @PathVariable Integer id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(reservationService.updateStatus(id, status));
    }

    @GetMapping("/full-stats")
    public ResponseEntity<?> getFullDashboardStats() {
        Map<String, Object> response = new HashMap<>();

        Map<String, Long> topStats = new HashMap<>();
        topStats.put("activeAdmins", adminRepository.count());
        topStats.put("registeredCustomers", userRepository.count());
        topStats.put("activeOrders", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM orders", Long.class));
        topStats.put("activeMenuItems", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM menu_items", Long.class));
        response.put("topStats", topStats);

        var categorySales = jdbcTemplate.queryForList(
                "SELECT c.name AS name, COALESCE(SUM(oi.quantity), 0) AS sales " +
                        "FROM categories c " +
                        "LEFT JOIN menu_items m ON c.id = m.category_id " +
                        "LEFT JOIN order_items oi ON m.id = oi.menu_item_id " +
                        "GROUP BY c.name HAVING sales > 0 ORDER BY sales DESC LIMIT 5"
        );
        response.put("categoryData", categorySales);

        return ResponseEntity.ok(response);
    }
}