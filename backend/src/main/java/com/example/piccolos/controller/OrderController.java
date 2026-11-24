package com.example.piccolos.controller;

import com.example.piccolos.dto.OrderDto;
import com.example.piccolos.entity.Order;
import com.example.piccolos.repository.OrderRepository;
import com.example.piccolos.service.OrderDtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDtoMapper orderDtoMapper;

    @PostMapping("/checkout")
    public ResponseEntity<?> placeOrder(@RequestBody OrderDto orderRequest) {
        if (orderRequest == null || orderRequest.items() == null || orderRequest.items().isEmpty()) {
            return ResponseEntity.badRequest().body("Your cart is empty.");
        }

        if (orderRequest.pickupDate() == null || orderRequest.pickupTime() == null) {
            return ResponseEntity.badRequest().body("Pickup date and time are required.");
        }

        LocalDate today = LocalDate.now();
        if (orderRequest.pickupDate().isBefore(today)
                || (orderRequest.pickupDate().equals(today) && orderRequest.pickupTime().isBefore(LocalTime.now()))) {
            return ResponseEntity.badRequest().body("Pickup time cannot be in the past.");
        }

        if (orderRequest.userId() == null) {
            if (orderRequest.guestName() == null || orderRequest.guestName().isBlank()
                    || orderRequest.guestPhone() == null || orderRequest.guestPhone().isBlank()) {
                return ResponseEntity.badRequest().body("Name and phone number are required for guest checkout.");
            }
        }

        try {
            Order order = orderDtoMapper.toEntity(orderRequest);
            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(orderDtoMapper.toDto(savedOrder));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to place order: " + e.getMessage());
        }
    }
}