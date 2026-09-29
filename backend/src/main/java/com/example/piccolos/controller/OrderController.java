package com.example.piccolos.controller;

import com.example.piccolos.dto.OrderRequest;
import com.example.piccolos.dto.OrderItemRequest;
import com.example.piccolos.entity.Order;
import com.example.piccolos.entity.OrderItem;
import com.example.piccolos.entity.MenuItem;
import com.example.piccolos.repository.OrderRepository;
import com.example.piccolos.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @PostMapping("/checkout")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request) {

        Order order = new Order();
        order.setGuestName(request.getGuestName());
        order.setOrderType(request.getOrderType());
        order.setStatus("PENDING");

        double subtotal = 0.0;

        // Process cart items
        for (OrderItemRequest itemRequest : request.getItems()) {

            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId().intValue())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemRequest.getMenuItemId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(menuItem.getPrice().doubleValue());

            subtotal += (menuItem.getPrice().doubleValue() * itemRequest.getQuantity());

            order.addOrderItem(orderItem);
        }

        // Calculate totals
        double taxAndFees = subtotal * 0.10;
        double totalAmount = subtotal + taxAndFees;

        order.setSubtotal(subtotal);
        order.setTaxAndFees(taxAndFees);
        order.setTotalAmount(totalAmount);

        // Save order
        orderRepository.save(order);

        return ResponseEntity.ok("Order placed successfully with ID: " + order.getId());
    }
}
