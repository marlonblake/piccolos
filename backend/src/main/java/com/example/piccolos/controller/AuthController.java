package com.example.piccolos.controller;

import com.example.piccolos.dto.RegisterRequest;
import com.example.piccolos.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    // Constructor Injection
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            // Pass the data to the Service layer
            String result = authService.registerUser(request);
            // Return a 200 OK status with the success message
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            // If the email is taken, return a 400 Bad Request with the error message
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
