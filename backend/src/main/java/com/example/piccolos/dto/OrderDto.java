package com.example.piccolos.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderDto(
        Long id,
        Long tableId,
        String guestName,
        String orderType,
        String status,
        List<ItemDto> items,
        BigDecimal total
) {
    public record ItemDto(
            Long id,
            Integer menuItemId,
            String name,
            BigDecimal price,
            Integer quantity,
            BigDecimal lineTotal
    ) {}
}
