package com.wellness.backend.controller;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // 🔹 Get logged-in user's profile
    @GetMapping("/profile")
    public ResponseEntity<UserEntity> getProfile() {
        String email = getCurrentUserEmail();
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).build());
    }

    // 🔹 Update logged-in user's profile
    @PutMapping("/profile")
    public ResponseEntity<UserEntity> updateProfile(@RequestBody UserEntity updatedProfile) {
        String email = getCurrentUserEmail();
        Optional<UserEntity> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).build();
        UserEntity user = userOpt.get();
        user.setName(updatedProfile.getName());
        user.setCity(updatedProfile.getCity());
        user.setCountry(updatedProfile.getCountry());
        user.setSpecialization(updatedProfile.getSpecialization());
        userService.saveUser(user);
        return ResponseEntity.ok(user);
    }

    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) return ((UserDetails) principal).getUsername();
        return principal.toString();
    }
}
