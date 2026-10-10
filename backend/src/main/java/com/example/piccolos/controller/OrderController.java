package com.example.piccolos.controller;

import com.example.piccolos.dto.OrderRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @PostMapping("/checkout")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest orderRequest) {

        return ResponseEntity.ok().build();
    }
}