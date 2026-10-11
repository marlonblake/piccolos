package com.example.piccolos.controller;

import com.example.piccolos.dto.OrderDto;
import com.example.piccolos.entity.Order;
import com.example.piccolos.repository.OrderRepository;
import com.example.piccolos.service.OrderDtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        try {
            Order order = orderDtoMapper.toEntity(orderRequest);

            Order savedOrder = orderRepository.save(order);

            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to place order: " + e.getMessage());
        }
    }
}