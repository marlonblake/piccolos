package com.example.piccolos.service;

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
import com.example.piccolos.dto.AuthResponse;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Constructor
    public AuthService(UserRepository userRepository, AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // CREATE
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

    // READ (Auth)
    public AuthResponse loginUser(LoginRequest request) {
        // 1. Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // 2. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // 3. Generate Token
        String token = jwtUtil.generateToken(user.getEmail(), "USER");

        // 4. Return both the token and the ID
        return new AuthResponse(token, user.getId());
    }

    // READ (Auth Admin)
    public String loginAdmin(LoginRequest request) {
        // 1. Find admin
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // 2. Verify password
        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // 3. Generate Token
        return jwtUtil.generateToken(admin.getEmail(), "ADMIN");
    }

    public String registerAdmin(LoginRequest request) {
        Optional<Admin> existingAdmin = adminRepository.findByEmail(request.getEmail());
        if (existingAdmin.isPresent()) {
            throw new RuntimeException("Admin email is already taken!");
        }

        Admin newAdmin = new Admin();
        newAdmin.setEmail(request.getEmail());

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        newAdmin.setPasswordHash(hashedPassword);

        adminRepository.save(newAdmin);
        return "Admin registered successfully!";
    }

    // READ (Profile Data)
    public User getUserProfile(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    // UPDATE
    public String updateUserProfile(Integer id, UpdateProfileRequest request) {
        // 1. Find the existing user
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        // 2. Update allowed fields
        existingUser.setFname(request.getFname());
        existingUser.setLname(request.getLname());
        existingUser.setPhoneNumber(request.getPhoneNumber());

        // 3. Save the changes
        userRepository.save(existingUser);

        return "Profile updated successfully!";
    }

    // DELETE
    public String deleteUserAccount(Integer id) {
        // 1. Find the existing user
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        // 2. Delete the user from the database
        userRepository.delete(existingUser);

        return "Account deleted successfully!";
    }
}