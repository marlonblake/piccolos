package com.example.piccolos.service;

import com.example.piccolos.entity.MenuItem;
import com.example.piccolos.entity.Order;
import com.example.piccolos.dto.OrderDto;
import com.example.piccolos.repository.StaffOrderItemRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class OrderDtoMapper {

    private final StaffOrderItemRepository itemRepo;

    public OrderDtoMapper(StaffOrderItemRepository itemRepo) {
        this.itemRepo = itemRepo;
    }

    public OrderDto toDto(Order order) {
        List<OrderDto.ItemDto> items = itemRepo.findByOrderId(order.getId()).stream().map(i -> {
            MenuItem m = i.getMenuItem();
            BigDecimal price = (m == null) ? BigDecimal.ZERO : money(m.getPrice());
            int qty = (i.getQuantity() == null) ? 0 : i.getQuantity();
            return new OrderDto.ItemDto(
                    i.getId(),
                    m == null ? null : m.getId(),
                    m == null ? "Unknown item" : String.valueOf(m.getName()),
                    price,
                    qty,
                    price.multiply(BigDecimal.valueOf(qty)));
        }).toList();

        BigDecimal total = items.stream()
                .map(OrderDto.ItemDto::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderDto(order.getId(), order.getTableId(), order.getGuestName(),
                order.getOrderType(), order.getStatus(), items, total);
    }

    /** Works whether the price field is Float, Double or BigDecimal. */
    public static BigDecimal money(Object value) {
        if (value == null) return BigDecimal.ZERO;
        return new BigDecimal(value.toString()).setScale(2, RoundingMode.HALF_UP);
    }
}