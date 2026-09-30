package com.example.piccolos.service;

import com.example.piccolos.entity.Invoice;
import com.example.piccolos.entity.MenuItem;
import com.example.piccolos.entity.Order;
import com.example.piccolos.entity.OrderItem;
import com.example.piccolos.repository.MenuItemRepository;
import com.example.piccolos.dto.AddItemRequest;
import com.example.piccolos.dto.InvoiceDto;
import com.example.piccolos.dto.OrderDto;
import com.example.piccolos.repository.StaffInvoiceRepository;
import com.example.piccolos.repository.StaffOrderItemRepository;
import com.example.piccolos.repository.StaffOrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

@Service
public class TicketService {

    private final StaffOrderRepository orderRepo;
    private final StaffOrderItemRepository itemRepo;
    private final StaffInvoiceRepository invoiceRepo;
    private final MenuItemRepository menuItemRepo;
    private final OrderDtoMapper mapper;

    @Value("${app.tax-rate:0.10}")
    private BigDecimal taxRate;

    public TicketService(StaffOrderRepository orderRepo,
                         StaffOrderItemRepository itemRepo,
                         StaffInvoiceRepository invoiceRepo,
                         MenuItemRepository menuItemRepo,
                         OrderDtoMapper mapper) {
        this.orderRepo = orderRepo;
        this.itemRepo = itemRepo;
        this.invoiceRepo = invoiceRepo;
        this.menuItemRepo = menuItemRepo;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOpenTickets(Long tableId) {
        return orderRepo.findOpenDineIn(tableId).stream().map(mapper::toDto).toList();
    }

    /** Opens a ticket for the table, or returns the one already open. */
    @Transactional
    public OrderDto openTicket(Long tableId) {
        Order order = orderRepo.findOpenDineIn(tableId).stream().findFirst().orElseGet(() -> {
            Order o = new Order();
            o.setTableId(tableId);
            o.setOrderType("DINE_IN");
            o.setStatus("PENDING");
            return orderRepo.save(o);
        });
        return mapper.toDto(order);
    }

    @Transactional
    public OrderDto addItem(Long orderId, AddItemRequest req) {
        Order order = findOrder(orderId);
        assertOpen(order);

        MenuItem menuItem = menuItemRepo.findById(req.menuItemId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Menu item " + req.menuItemId() + " not found"));

        OrderItem existing = itemRepo.findByOrderId(orderId).stream()
                .filter(i -> i.getMenuItem() != null
                        && Objects.equals(i.getMenuItem().getId(), menuItem.getId()))
                .findFirst().orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + req.quantity());
            itemRepo.save(existing);
        } else {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setMenuItem(menuItem);
            item.setQuantity(req.quantity());
            itemRepo.save(item);
        }

        // New food after the order was ready/completed goes back to the kitchen
        String status = order.getStatus() == null ? "" : order.getStatus().toUpperCase();
        if (status.equals("READY") || status.equals("COMPLETED")) {
            order.setStatus("PENDING");
            orderRepo.save(order);
        }
        return mapper.toDto(order);
    }

    @Transactional
    public OrderDto removeItem(Long orderId, Long itemId) {
        Order order = findOrder(orderId);
        assertOpen(order);

        OrderItem item = itemRepo.findById(itemId)
                .filter(i -> i.getOrder() != null && Objects.equals(i.getOrder().getId(), orderId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Item " + itemId + " is not on this order"));
        itemRepo.delete(item);
        return mapper.toDto(order);
    }

    @Transactional
    public InvoiceDto generateInvoice(Long tableId) {
        Order order = orderRepo.findOpenDineIn(tableId).stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "No open ticket for table " + tableId));

        BigDecimal subtotal = mapper.toDto(order).total();
        if (subtotal.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket has no items");
        }
        BigDecimal tax = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);

        Invoice invoice = new Invoice();
        invoice.setOrder(order);
        invoice.setTaxAmount(tax.floatValue());
        invoice.setTotalAmount(subtotal.add(tax).floatValue());
        return toInvoiceDto(invoiceRepo.save(invoice));
    }

    @Transactional(readOnly = true)
    public InvoiceDto getInvoice(Long invoiceId) {
        return toInvoiceDto(findInvoice(invoiceId));
    }

    /** Payment closes the order. */
    @Transactional
    public InvoiceDto markPaid(Long invoiceId) {
        Invoice invoice = findInvoice(invoiceId);
        Order order = invoice.getOrder();
        if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice already paid");
        }
        order.setStatus("COMPLETED");
        orderRepo.save(order);
        return toInvoiceDto(invoice);
    }

    // ---------- helpers ----------

    private InvoiceDto toInvoiceDto(Invoice inv) {
        BigDecimal total = OrderDtoMapper.money(inv.getTotalAmount());
        BigDecimal tax = OrderDtoMapper.money(inv.getTaxAmount());
        Order order = inv.getOrder();
        return new InvoiceDto(
                inv.getId(),
                order.getId(),
                order.getTableId(),
                total.subtract(tax),
                tax,
                total,
                inv.getIssuedAt(),
                "COMPLETED".equalsIgnoreCase(order.getStatus()));
    }

    private void assertOpen(Order order) {
        if (!"DINE_IN".equalsIgnoreCase(order.getOrderType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only dine-in tickets can be edited here");
        }
        if ("CANCELLED".equalsIgnoreCase(order.getStatus())
                || invoiceRepo.findByOrderId(order.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket is closed");
        }
    }

    private Order findOrder(Long id) {
        return orderRepo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Order " + id + " not found"));
    }

    private Invoice findInvoice(Long id) {
        return invoiceRepo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice " + id + " not found"));
    }
}