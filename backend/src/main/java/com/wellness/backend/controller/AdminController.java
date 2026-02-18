package com.wellness.backend.controller;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Collections;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.wellness.backend.service.EmailService emailService;

    @GetMapping("/users")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        System.out.println("DEBUG: Fetching users for admin dashboard");
        List<UserEntity> practitioners = userRepository.findByRole("PROVIDER").stream()
                .filter(u -> "PENDING_ADMIN_APPROVAL".equalsIgnoreCase(u.getVerificationStatus()) ||
                        "PENDING".equalsIgnoreCase(u.getVerificationStatus()))
                .toList();
        System.out.println("DEBUG: Found " + practitioners.size() + " pending practitioners");
        return ResponseEntity.ok(practitioners);
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        System.out.println("APPROVE ID: " + id);
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Practitioner not found"));
        }
        // Prevent re-approval if already approved/verified
        if ("APPROVED".equalsIgnoreCase(user.getVerificationStatus())) {
            return ResponseEntity.ok(Collections.singletonMap("message", "User already approved"));
        }
        user.setVerificationStatus("APPROVED");
        user.setEmailVerified(true); // Ensure they are marked verified
        userRepository.save(user);
        emailService.sendApprovalEmail(user.getEmail());
        return ResponseEntity.ok(Collections.singletonMap("message", "User approved successfully"));
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Practitioner not found"));
        }
        user.setVerificationStatus("REJECTED");
        userRepository.save(user);
        emailService.sendRejectionEmail(user.getEmail());
        return ResponseEntity.ok(Collections.singletonMap("message", "User rejected successfully"));
    }
}
