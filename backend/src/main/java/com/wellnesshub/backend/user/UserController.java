package com.wellnesshub.backend.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication auth) {
        String email = auth.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(RuntimeException::new);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().name());
        profile.put("city", user.getCity());
        profile.put("country", user.getCountry());

        if (user.getRole() == UserRole.PRACTITIONER) {
            profile.put("specialization", user.getSpecialization());
            profile.put("verificationStatus", user.getVerificationStatus());
        }

        return ResponseEntity.ok(profile);
    }

    @PostMapping("/verify-practitioner/{id}")
    public ResponseEntity<String> verifyPractitioner(@PathVariable Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(RuntimeException::new);

        if (user.getRole() == UserRole.PRACTITIONER) {
            user.setVerificationStatus("VERIFIED");
            userRepository.save(user);
            return ResponseEntity.ok("Practitioner verified");
        }

        return ResponseEntity.badRequest().body("Not a practitioner");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication auth) {
        String email = auth.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(RuntimeException::new);

        Map<String, Object> dashboard = new HashMap<>();

        Map<String, String> profileMap = new HashMap<>();
        profileMap.put("fullName", user.getFullName());
        profileMap.put("email", user.getEmail());
        profileMap.put("role", user.getRole().name());

        dashboard.put("profile", profileMap);

        if (user.getRole() == UserRole.PATIENT) {
            dashboard.put("sessionHistory", new ArrayList<>());
            dashboard.put("productOrders", new ArrayList<>());
        } else if (user.getRole() == UserRole.PRACTITIONER) {
            dashboard.put("specialization", user.getSpecialization());
            dashboard.put("verificationStatus", user.getVerificationStatus());
        }

        return ResponseEntity.ok(dashboard);
    }
}
