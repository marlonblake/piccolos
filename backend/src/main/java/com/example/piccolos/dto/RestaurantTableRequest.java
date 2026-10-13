package com.example.piccolos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RestaurantTableRequest(
        @NotNull @Min(1) Integer tableNumber,
        @NotNull @Min(1) Integer capacity
) {}
