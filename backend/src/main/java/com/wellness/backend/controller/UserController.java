package com.wellness.backend.controller;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import com.wellness.backend.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private static final String UPLOAD_DIR = "uploads/degrees"; // folder in your project ***REMOVED***

    // Get user profile from JWT token
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        return userOpt.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("User not found"));
    }

    // Dashboard placeholder
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        return userOpt.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("User not found"));
    }

    
}
