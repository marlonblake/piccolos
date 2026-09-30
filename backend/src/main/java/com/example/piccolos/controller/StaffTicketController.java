package com.example.piccolos.controller;

import com.example.piccolos.dto.AddItemRequest;
import com.example.piccolos.dto.InvoiceDto;
import com.example.piccolos.dto.OrderDto;
import com.example.piccolos.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffTicketController {

    private final TicketService tickets;

    public StaffTicketController(TicketService tickets) {
        this.tickets = tickets;
    }

    @GetMapping("/tables/{tableId}/tickets")
    public List<OrderDto> openTickets(@PathVariable Long tableId) {
        return tickets.getOpenTickets(tableId);
    }

    @PostMapping("/tickets")
    public OrderDto open(@RequestParam Long tableId) {
        return tickets.openTicket(tableId);
    }

    @PostMapping("/tickets/{orderId}/items")
    public OrderDto addItem(@PathVariable Long orderId, @Valid @RequestBody AddItemRequest req) {
        return tickets.addItem(orderId, req);
    }

    @DeleteMapping("/tickets/{orderId}/items/{itemId}")
    public OrderDto removeItem(@PathVariable Long orderId, @PathVariable Long itemId) {
        return tickets.removeItem(orderId, itemId);
    }

    @PostMapping("/tables/{tableId}/invoice")
    public InvoiceDto generateInvoice(@PathVariable Long tableId) {
        return tickets.generateInvoice(tableId);
    }

    @GetMapping("/invoices/{id}")
    public InvoiceDto getInvoice(@PathVariable Long id) {
        return tickets.getInvoice(id);
    }

    @PatchMapping("/invoices/{id}/pay")
    public InvoiceDto pay(@PathVariable Long id) {
        return tickets.markPaid(id);
    }
}