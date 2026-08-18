package com.example.piccolos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    // The SecurityConfig requires ROLE_USER for anything under /api/customer/**
    @GetMapping("/customer/dashboard")
    public ResponseEntity<String> getCustomerData() {
        return ResponseEntity.ok("Success! You have accessed the protected customer data.");
    }

    // The SecurityConfig requires ROLE_ADMIN for anything under /api/admin/**
    @GetMapping("/admin/dashboard")
    public ResponseEntity<String> getAdminData() {
        return ResponseEntity.ok("Success! You have accessed the highly classified admin data.");
    }
}