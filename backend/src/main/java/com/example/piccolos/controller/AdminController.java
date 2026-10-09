package com.example.piccolos.controller;

import com.example.piccolos.dto.DashboardStatsResponse;
import com.example.piccolos.repository.AdminRepository;
import com.example.piccolos.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173") // or 5173 depending on your Vite config
public class AdminController {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public AdminController(AdminRepository adminRepository, UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // These fetch REAL live counts from your MySQL tables
        stats.setActiveAdmins(adminRepository.count());
        stats.setRegisteredCustomers(userRepository.count());

        // Placeholders until your team members merge their backend modules
        stats.setActiveOrders(0);
        stats.setActiveMenuItems(0);

        return ResponseEntity.ok(stats);
    }
}