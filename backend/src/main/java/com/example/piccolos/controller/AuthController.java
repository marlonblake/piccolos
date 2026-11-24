package com.example.piccolos.controller;

import com.example.piccolos.dto.RegisterRequest;
import com.example.piccolos.dto.LoginRequest;
import com.example.piccolos.dto.UpdateProfileRequest;
import com.example.piccolos.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.piccolos.dto.AuthResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    // Constructor Injection
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // CREATE: Register a new customer
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            String result = authService.registerUser(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // READ: Authenticate customer and issue JWT
    @PostMapping("/user/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.loginUser(request);
            return ResponseEntity.ok(response); // Returns JSON: { "token": "ey...", "userId": 1 }
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // READ: Authenticate staff/admin and issue JWT
    @PostMapping("/admin/login")
    public ResponseEntity<String> loginAdmin(@RequestBody LoginRequest request) {
        try {
            String token = authService.loginAdmin(request);
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // READ: Fetch specific user profile details for the frontend settings page
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Integer id) {
        try {
            Object userProfile = authService.getUserProfile(id);
            return ResponseEntity.ok(userProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // UPDATE: Modify profile details (e.g., name, phone number)
    @PutMapping("/user/{id}")
    public ResponseEntity<String> updateUserProfile(@PathVariable Integer id, @RequestBody UpdateProfileRequest request) {
        try {
            String result = authService.updateUserProfile(id, request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE: Remove or deactivate a user account
    @DeleteMapping("/user/{id}")
    public ResponseEntity<String> deleteUserAccount(@PathVariable Integer id) {
        try {
            String result = authService.deleteUserAccount(id);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/admin/register")
    public ResponseEntity<String> registerAdmin(@RequestBody LoginRequest request) {
        try {
            String result = authService.registerAdmin(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}