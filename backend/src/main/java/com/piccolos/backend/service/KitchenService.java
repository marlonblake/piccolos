package com.piccolos.backend.service;

import com.example.piccolos.entity.Order;
import com.piccolos.backend.dto.OrderDto;
import com.piccolos.backend.model.OrderStatus;
import com.piccolos.backend.repository.StaffOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class KitchenService {

    private static final List<String> ACTIVE = List.of("PENDING", "PREPARING", "READY");

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = Map.of(
            OrderStatus.PENDING,   Set.of(OrderStatus.PREPARING, OrderStatus.CANCELLED),
            OrderStatus.PREPARING, Set.of(OrderStatus.READY, OrderStatus.CANCELLED),
            OrderStatus.READY,     Set.of(OrderStatus.COMPLETED),
            OrderStatus.COMPLETED, Set.of(),
            OrderStatus.CANCELLED, Set.of());

    private final StaffOrderRepository orderRepo;
    private final OrderDtoMapper mapper;

    public KitchenService(StaffOrderRepository orderRepo, OrderDtoMapper mapper) {
        this.orderRepo = orderRepo;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getKitchenOrders(String type) {
        List<Order> orders = (type == null || type.isBlank())
                ? orderRepo.findActive(ACTIVE)
                : orderRepo.findActiveByType(ACTIVE, type.trim().toUpperCase());
        return orders.stream()
                .map(mapper::toDto)
                .filter(d -> !d.items().isEmpty())
                .toList();
    }

    @Transactional
    public OrderDto updateStatus(Long orderId, OrderStatus next) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order " + orderId + " not found"));

        OrderStatus current = parse(order.getStatus());
        if (!ALLOWED.get(current).contains(next)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot change order from " + current + " to " + next);
        }
        if (next == OrderStatus.COMPLETED && "DINE_IN".equalsIgnoreCase(order.getOrderType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Dine-in orders are completed when the invoice is paid");
        }
        order.setStatus(next.name());
        return mapper.toDto(orderRepo.save(order));
    }

    private OrderStatus parse(String status) {
        if (status == null) return OrderStatus.PENDING;
        try {
            return OrderStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return OrderStatus.PENDING;
        }
    }
}