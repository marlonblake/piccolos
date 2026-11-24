package com.example.piccolos.dto;

import com.example.piccolos.entity.RestaurantTable;

public record RestaurantTableResponse(
        Integer id,
        Integer tableNumber,
        Integer capacity
) {
    public RestaurantTableResponse(RestaurantTable table) {
        this(table.getId(), table.getTableNumber(), table.getCapacity());
    }
}
