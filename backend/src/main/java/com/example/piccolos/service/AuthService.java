package com.example.piccolos.service;

import com.example.piccolos.dto.RegisterRequest;
import com.example.piccolos.entity.User;
import com.example.piccolos.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor Injection (Best Practice)
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String registerUser(RegisterRequest request) {
        // 1. Check if email already exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email is already taken!");
        }

        // 2. Create a new User entity
        User newUser = new User();
        newUser.setFname(request.getFname());
        newUser.setLname(request.getLname());
        newUser.setEmail(request.getEmail());
        newUser.setPhoneNumber(request.getPhoneNumber());

        // 3. Hash the password before saving
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        newUser.setPasswordHash(hashedPassword);

        // 4. Save to database
        userRepository.save(newUser);

        return "User registered successfully!";
    }
}
