package com.example.piccolos.service;

import com.example.piccolos.dto.AuthResponse;
import com.example.piccolos.dto.LoginRequest;
import com.example.piccolos.dto.RegisterRequest;
import com.example.piccolos.dto.UpdateProfileRequest;
import com.example.piccolos.entity.Admin;
import com.example.piccolos.entity.User;
import com.example.piccolos.repository.AdminRepository;
import com.example.piccolos.repository.UserRepository;
import com.example.piccolos.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MAX_PASSWORD_LENGTH = 72;

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password cannot be empty.");
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new RuntimeException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters long.");
        }
        if (password.length() > MAX_PASSWORD_LENGTH) {
            throw new RuntimeException("Password must not exceed " + MAX_PASSWORD_LENGTH + " characters.");
        }
    }

    // CREATE
    public String registerUser(RegisterRequest request) {
        validatePassword(request.getPassword());

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email is already taken!");
        }

        User newUser = new User();
        newUser.setFname(request.getFname());
        newUser.setLname(request.getLname());
        newUser.setEmail(request.getEmail());
        newUser.setPhoneNumber(request.getPhoneNumber());

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        newUser.setPasswordHash(hashedPassword);

        userRepository.save(newUser);
        return "User registered successfully!";
    }

    // READ (Auth)
    public AuthResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), "USER");
        return new AuthResponse(token, user.getId());
    }

    // READ (Auth Admin)
    public String loginAdmin(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        return jwtUtil.generateToken(admin.getEmail(), "ADMIN");
    }

    public String registerAdmin(LoginRequest request) {
        validatePassword(request.getPassword());

        Optional<Admin> existingAdmin = adminRepository.findByEmail(request.getEmail());
        if (existingAdmin.isPresent()) {
            throw new RuntimeException("Admin email is already taken!");
        }

        Admin newAdmin = new Admin();
        newAdmin.setEmail(request.getEmail());
        newAdmin.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        adminRepository.save(newAdmin);
        return "Admin registered successfully";
    }

    // READ (Profile Data)
    public User getUserProfile(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    // UPDATE
    public String updateUserProfile(Integer id, UpdateProfileRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        existingUser.setFname(request.getFname());
        existingUser.setLname(request.getLname());
        existingUser.setPhoneNumber(request.getPhoneNumber());

        userRepository.save(existingUser);
        return "Profile updated successfully!";
    }

    // DELETE
    public String deleteUserAccount(Integer id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        userRepository.delete(existingUser);
        return "Account deleted successfully!";
    }
}