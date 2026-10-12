package com.example.piccolos.service;

import com.example.piccolos.entity.MenuItem;
import com.example.piccolos.entity.Order;
import com.example.piccolos.entity.OrderItem;
import com.example.piccolos.dto.OrderDto;
import com.example.piccolos.repository.StaffOrderItemRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    public Order toEntity(OrderDto dto) {
        Order order = new Order();
        order.setGuestName(dto.guestName());
        order.setTableId(dto.tableId());

        order.setOrderType(dto.orderType());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        if (dto.total() != null) {
            order.setTotalAmount(dto.total().doubleValue());
            order.setSubtotal(dto.total().doubleValue());
        }

        if (dto.items() != null) {
            List<OrderItem> orderItems = dto.items().stream().map(itemDto -> {
                OrderItem item = new OrderItem();

                item.setQuantity(itemDto.quantity());

                if (itemDto.menuItemId() != null) {
                    MenuItem menuItem = new MenuItem();
                    menuItem.setId(itemDto.menuItemId());
                    item.setMenuItem(menuItem);
                }

                if (itemDto.price() != null) {
                    item.setPrice(itemDto.price().doubleValue());
                }

                item.setOrder(order);
                return item;
            }).collect(Collectors.toList());

            order.setOrderItems(orderItems);
        }

        return order;
    }

    public static BigDecimal money(Object value) {
        if (value == null) return BigDecimal.ZERO;
        return new BigDecimal(value.toString()).setScale(2, RoundingMode.HALF_UP);
    }
}