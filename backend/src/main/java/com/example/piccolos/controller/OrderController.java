package com.example.piccolos.controller;

import com.example.piccolos.dto.OrderRequest;
import com.example.piccolos.entity.Order;
import com.example.piccolos.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<Order> submitCart(@RequestBody OrderRequest cartRequest) {
        Order savedOrder = orderService.processDigitalCart(cartRequest);
        return ResponseEntity.ok(savedOrder);
    }
}