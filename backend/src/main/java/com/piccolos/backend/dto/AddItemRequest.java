package com.piccolos.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddItemRequest(
        @NotNull Integer menuItemId,
        @NotNull @Min(1) Integer quantity
) {}