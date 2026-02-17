package com.wellness.backend.controller;

import com.wellness.backend.dto.LoginRequest;
import com.wellness.backend.dto.RegisterRequest;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import com.wellness.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 🔥 THIS WILL RESET ADMIN PASSWORD ON STARTUP (ONE TIME)
    @Bean
    CommandLineRunner resetAdminPassword() {
        return args -> {
            Optional<UserEntity> userOpt = userRepository.findByEmail("***REMOVED***");
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                user.setPassword(passwordEncoder.encode("***REMOVED***"));
                userRepository.save(user);
                System.out.println("✅ Admin password reset successfully!");
            }
        };
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "Email already exists"));
        }

        UserEntity user = new UserEntity();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole().toString());
        user.setSpecialization(request.getSpecialization());
        user.setCity(request.getCity());
        user.setCountry(request.getCountry());

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(Collections.singletonMap("accessToken", token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<UserEntity> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();

            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
                return ResponseEntity.ok(Collections.singletonMap("accessToken", token));
            }
        }

        return ResponseEntity.status(401)
                .body(Collections.singletonMap("error", "Invalid email or password"));
    }
}
