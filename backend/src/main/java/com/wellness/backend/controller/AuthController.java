package com.wellness.backend.controller;

import com.wellness.backend.dto.AuthenticationResponse;
import com.wellness.backend.dto.LoginRequest;
import com.wellness.backend.dto.RegisterRequest;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import com.wellness.backend.service.AuthService;
import com.wellness.backend.service.EmailService;
import com.wellness.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthService authService;

    // 🔥 Reset admin password on startup
    @Bean
    CommandLineRunner initializeData() {
        return args -> {
            // Seed/Reset Admin
            Optional<UserEntity> userOpt = userRepository.findByEmail("***REMOVED***");
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                user.setPassword(passwordEncoder.encode("***REMOVED***"));
                user.setEmailVerified(true); // Ensure admin is always verified
                userRepository.save(user);
                System.out.println("✅ Admin initialized/reset successfully!");
            }

            // Migration: Mark all existing users as verified if they don't have a token
            // This satisfies the "Existing users should NOT trigger email verification"
            // requirement
            userRepository.findAll().forEach(u -> {
                if (u.getVerificationToken() == null && !u.isEmailVerified()) {
                    u.setEmailVerified(true);
                    userRepository.save(u);
                }
            });
        };
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@jakarta.validation.Valid @RequestBody RegisterRequest request) {
        System.out.println("REGISTER REQUEST: " + request);

        try {
            AuthenticationResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if ("Email already exists and is verified".equals(e.getMessage())) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("error", "Email already exists"));
            }
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email and OTP are required"));
        }

        try {
            AuthenticationResponse response = authService.verifyOtp(email, otp);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            String otp = String.format("%06d", new Random().nextInt(999999));
            user.setOtp(otp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            emailService.sendOtpEmail(user.getEmail(), otp);
            return ResponseEntity.ok(Collections.singletonMap("message", "OTP resent successfully"));
        }
        return ResponseEntity.badRequest().body(Collections.singletonMap("error", "User not found"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            // Reset logic: Admin doesn't get this
            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "Action not allowed for Admin"));
            }

            String newPassword = UUID.randomUUID().toString().substring(0, 8);
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            emailService.sendForgotPasswordEmail(user.getEmail(), newPassword);
            return ResponseEntity.ok(Collections.singletonMap("message", "Temporary password sent to your email"));
        }
        return ResponseEntity.badRequest().body(Collections.singletonMap("error", "User not found"));
    }

    // Keep legacy verify for existing tokens if necessary, or decommission
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        Optional<UserEntity> userOpt = userRepository.findByVerificationToken(token);

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            user.setEmailVerified(true);
            user.setVerificationToken(null);
            userRepository.save(user);
            return ResponseEntity.ok(Collections.singletonMap("message", "Email verified successfully"));
        }

        return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid verification token"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<UserEntity> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();

            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

                return ResponseEntity.ok(
                        new AuthenticationResponse(token, user.getRole(), user.getName(), user.isEmailVerified()));
            }
        }

        return ResponseEntity.status(401)
                .body(Collections.singletonMap("error", "Invalid email or password"));
    }
}
