package com.example.piccolos.service;

import com.example.piccolos.dto.CartItem;
import com.example.piccolos.dto.OrderRequest;
import com.example.piccolos.entity.MenuItem;
import com.example.piccolos.entity.Order;
import com.example.piccolos.entity.OrderItem;
import com.example.piccolos.entity.User;
import com.example.piccolos.repository.MenuItemRepository;
import com.example.piccolos.repository.OrderItemRepository;
import com.example.piccolos.repository.OrderRepository;
import com.example.piccolos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Transactional
    public Order processDigitalCart(OrderRequest cartRequest) {
        Order newOrder = new Order();
        newOrder.setStatus("PENDING");
        newOrder.setOrderType("PICKUP");

        if (cartRequest.getUserId() != null) {
            User customer = userRepository.findById(cartRequest.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            newOrder.setUser(customer);
        } else {
            newOrder.setGuestName(cartRequest.getGuestName());
        }

        Order savedOrder = orderRepository.save(newOrder);

        for (CartItem itemDto : cartRequest.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemDto.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItemRepository.save(orderItem);
        }

        return savedOrder;
    }
}
