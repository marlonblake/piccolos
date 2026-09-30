package com.example.piccolos.controller;

import com.example.piccolos.dto.OrderDto;
import com.example.piccolos.model.OrderStatus;
import com.example.piccolos.service.KitchenService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff/orders")
public class KitchenController {

    private final KitchenService kitchenService;

    public KitchenController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    @GetMapping("/kitchen")
    public List<OrderDto> kitchen(@RequestParam(required = false) String type) {
        return kitchenService.getKitchenOrders(type);
    }

    @PutMapping("/{id}/status")
    public OrderDto updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return kitchenService.updateStatus(id, status);
    }
}