package com.example.piccolos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InvoiceDto(
        Long id,
        Long orderId,
        Long tableId,
        BigDecimal subtotal,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        LocalDateTime issuedAt,
        boolean paid
) {}