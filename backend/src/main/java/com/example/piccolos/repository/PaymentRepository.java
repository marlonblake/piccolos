package com.example.piccolos.repository;

import com.example.piccolos.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByInvoiceId(Long invoiceId);
    List<Payment> findByInvoiceId(Long invoiceId);
}