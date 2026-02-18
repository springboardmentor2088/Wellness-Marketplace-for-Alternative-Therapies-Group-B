package com.wellness.backend.service;

import com.wellness.backend.dto.AuthenticationResponse;
import com.wellness.backend.dto.RegisterRequest;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import com.wellness.backend.util.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        Optional<UserEntity> existingUserOpt = userRepository.findByEmail(request.getEmail());
        UserEntity user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (user.isEmailVerified()) {
                throw new RuntimeException("Email already exists and is verified");
            }
            // Update existing unverified user
            user.setName(request.getName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole().toString());
            user.setSpecialization(request.getSpecialization());
            user.setCity(request.getCity());
            user.setCountry(request.getCountry());
        } else {
            // Create new user
            user = new UserEntity();
            user.setEmail(request.getEmail());
            user.setName(request.getName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole().toString());
            user.setSpecialization(request.getSpecialization());
            user.setCity(request.getCity());
            user.setCountry(request.getCountry());
            user.setEmailVerified(false);
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        // Send OTP email
        try {
            emailService.sendOtpEmail(user.getEmail(), otp);
        } catch (Exception e) {
            System.out.println("❌ Email dispatch failed for " + user.getEmail() + ": " + e.getMessage());
        }

        String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthenticationResponse(jwt, user.getRole(), user.getName(), user.isEmailVerified());
    }
}
