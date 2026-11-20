package com.example.piccolos.service;

import com.example.piccolos.dto.OrderDto;
import com.example.piccolos.entity.MenuItem;
import com.example.piccolos.entity.Order;
import com.example.piccolos.entity.OrderItem;
import com.example.piccolos.entity.User;
import com.example.piccolos.repository.StaffOrderItemRepository;
import com.example.piccolos.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderDtoMapper {

    private final StaffOrderItemRepository itemRepo;
    private final UserRepository userRepo;

    public OrderDtoMapper(StaffOrderItemRepository itemRepo, UserRepository userRepo) {
        this.itemRepo = itemRepo;
        this.userRepo = userRepo;
    }

    public OrderDto toDto(Order order) {
        List<OrderDto.ItemDto> items = itemRepo.findByOrderId(order.getId()).stream().map(i -> {
            MenuItem m = i.getMenuItem();
            BigDecimal unitPrice = resolveSavedUnitPrice(i, m);
            int qty = (i.getQuantity() == null) ? 0 : i.getQuantity();
            return new OrderDto.ItemDto(
                    i.getId(),
                    m == null ? null : m.getId(),
                    m == null ? "Unknown item" : String.valueOf(m.getName()),
                    unitPrice,
                    qty,
                    unitPrice.multiply(BigDecimal.valueOf(qty)));
        }).toList();

        BigDecimal total = items.stream()
                .map(OrderDto.ItemDto::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long userId = (order.getUser() != null) ? (long) order.getUser().getId() : null;

        return new OrderDto(order.getId(), order.getTableId(), userId, order.getGuestName(),
                order.getOrderType(), order.getStatus(), items, total);
    }

    public Order toEntity(OrderDto dto) {
        Order order = new Order();
        order.setTableId(dto.tableId());
        order.setOrderType(dto.orderType());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        if (dto.userId() != null) {
            User user = userRepo.findById(dto.userId().intValue())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.userId()));
            order.setUser(user);
            order.setGuestName(user.getFname());
        } else {
            order.setGuestName(dto.guestName());
        }

        if (dto.total() != null) {
            order.setTotalAmount(dto.total().doubleValue());
            order.setSubtotal(dto.total().doubleValue());
        }

        if (dto.items() != null) {
            List<OrderItem> orderItems = dto.items().stream().map(itemDto -> {
                OrderItem item = new OrderItem();
                int qty = (itemDto.quantity() == null) ? 1 : itemDto.quantity();
                item.setQuantity(qty);

                if (itemDto.menuItemId() != null) {
                    MenuItem menuItem = new MenuItem();
                    menuItem.setId(itemDto.menuItemId().intValue());
                    item.setMenuItem(menuItem);
                }

                if (itemDto.price() != null) {
                    BigDecimal unit = money(itemDto.price());
                    item.setUnitPrice(unit.doubleValue());
                    item.setPrice(unit.multiply(BigDecimal.valueOf(qty)).doubleValue());
                }

                item.setOrder(order);
                return item;
            }).collect(Collectors.toList());

            order.setOrderItems(orderItems);
        }

        return order;
    }

    private BigDecimal resolveSavedUnitPrice(OrderItem item, MenuItem menuItem) {
        if (item.getUnitPrice() != null && item.getUnitPrice() > 0) {
            return money(item.getUnitPrice());
        }
        int qty = (item.getQuantity() == null || item.getQuantity() <= 0) ? 1 : item.getQuantity();
        if (item.getPrice() != null && item.getPrice() > 0) {
            return money(item.getPrice()).divide(BigDecimal.valueOf(qty), 2, RoundingMode.HALF_UP);
        }
        if (menuItem != null) {
            String normalizedSize = normalizeSize(item.getSize());
            if ("14".equals(normalizedSize) && menuItem.getPrice14() != null) {
                return money(menuItem.getPrice14());
            }
            if ("11".equals(normalizedSize) && menuItem.getPrice11() != null) {
                return money(menuItem.getPrice11());
            }
            if (menuItem.getPrice() != null) {
                return money(menuItem.getPrice());
            }
        }
        return BigDecimal.ZERO;
    }

    public static String normalizeSize(String rawSize) {
        if (rawSize == null || rawSize.isBlank()) {
            return null;
        }
        String cleaned = rawSize.replace("\"", "").replace("″", "").replace("in", "").trim();
        if ("14".equals(cleaned)) return "14";
        if ("11".equals(cleaned)) return "11";
        return cleaned;
    }

    public static BigDecimal money(Object value) {
        if (value == null) return BigDecimal.ZERO;
        return new BigDecimal(value.toString()).setScale(2, RoundingMode.HALF_UP);
    }
}