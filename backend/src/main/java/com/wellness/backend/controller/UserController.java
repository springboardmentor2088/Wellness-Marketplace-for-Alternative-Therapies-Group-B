package com.wellness.backend.controller;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private com.wellness.backend.repository.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // Get logged-in user's profile
    @GetMapping("/profile")
    public ResponseEntity<UserEntity> getProfile() {
        String email = getCurrentUserEmail();
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).build());
    }

    // Update logged-in user's profile
    @PutMapping("/profile")
    public ResponseEntity<UserEntity> updateProfile(@RequestBody UserEntity updatedProfile) {
        String email = getCurrentUserEmail();
        Optional<UserEntity> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).build();
        UserEntity user = userOpt.get();

        // Update profile fields
        if (updatedProfile.getName() != null && !updatedProfile.getName().isBlank())
            user.setName(updatedProfile.getName());
        if (updatedProfile.getCity() != null)
            user.setCity(updatedProfile.getCity());
        if (updatedProfile.getCountry() != null)
            user.setCountry(updatedProfile.getCountry());
        if (updatedProfile.getSpecialization() != null)
            user.setSpecialization(updatedProfile.getSpecialization());
        if (updatedProfile.getSessionFee() != null)
            user.setSessionFee(updatedProfile.getSessionFee());

        // Update password if provided
        if (updatedProfile.getPassword() != null && !updatedProfile.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedProfile.getPassword()));
        }

        userService.saveUser(user);
        return ResponseEntity.ok(user);
    }

    // Public endpoint: returns all APPROVED practitioners (for patient dashboard &
    // marketplace)
    @GetMapping("/practitioners")
    public ResponseEntity<List<UserEntity>> getApprovedPractitioners() {
        List<UserEntity> approved = userRepository.findByRole("PROVIDER").stream()
                .filter(u -> "APPROVED".equalsIgnoreCase(u.getVerificationStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(approved);
    }

    // Public endpoint: returns all practitioners regardless of status (for
    // admin-like views)
    @GetMapping("/all-practitioners")
    public ResponseEntity<List<UserEntity>> getAllPractitioners() {
        List<UserEntity> practitioners = userRepository.findByRole("PROVIDER");
        return ResponseEntity.ok(practitioners);
    }

    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails)
            return ((UserDetails) principal).getUsername();
        return principal.toString();
    }
}
