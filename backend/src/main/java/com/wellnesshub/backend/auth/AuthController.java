package com.wellnesshub.backend.auth;

import com.wellnesshub.backend.security.JwtService;
import com.wellnesshub.backend.user.UserEntity;
import com.wellnesshub.backend.user.UserRepository;
import com.wellnesshub.backend.practitioner.PractitionerProfileEntity;
import com.wellnesshub.backend.practitioner.PractitionerProfileRepository;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;


import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PractitionerProfileRepository practitionerProfileRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;



    public AuthController(
            UserRepository userRepository,
            PractitionerProfileRepository practitionerProfileRepository,
            JwtService jwtService,
             PasswordEncoder passwordEncoder
) {
        this.userRepository = userRepository;
        this.practitionerProfileRepository = practitionerProfileRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        try {
            System.out.println("=== Registration Attempt ===");
            System.out.println("Request payload: " + request);

            String email = request.get("email");
            String password = request.get("password");
            String name = request.get("name");
            if (name == null || name.isEmpty()) {
                name = request.get("fullName");
            }
            String role = request.get("role");
            String city = request.get("city");
            String country = request.get("country");
            String specialization = request.get("specialization");

            System.out.println("Checking required fields...");
            if (email == null || password == null || name == null || role == null) {
                System.err.println("Missing fields: " + request);
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Missing required fields");
                return ResponseEntity.badRequest().body(error);
            }

            if (userRepository.findByEmail(email).isPresent()) {
                System.err.println("Email already exists: " + email);
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Email already exists");
                return ResponseEntity.badRequest().body(error);
            }

            // ===== Create new user and set isActive =====
            UserEntity user = new UserEntity();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setCity(city);
            user.setCountry(country);
            user.setIsActive(true); // <-- fix for MySQL error

            UserEntity savedUser = userRepository.save(user);
            System.out.println("User saved: " + savedUser);

            // If user is a Practitioner, create a profile
            if ("PRACTITIONER".equalsIgnoreCase(role)) {
                System.out.println("Creating practitioner profile for: " + savedUser.getEmail());
                PractitionerProfileEntity profile = new PractitionerProfileEntity();
                profile.setUser(savedUser);
                profile.setSpecialization(specialization != null ? specialization : "General");
                profile.setClinicName(city != null ? city : "Default Clinic");
                profile.setVerificationStatus(PractitionerProfileEntity.VerificationStatus.PENDING);
                profile.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                practitionerProfileRepository.save(profile);
                System.out.println("Practitioner profile saved: " + profile);
            }

            // Generate JWT token
            Map<String, Object> claims = new HashMap<>();
            claims.put("email", email);
            claims.put("role", role);

            String token = jwtService.generateToken(claims, email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("token", token);
            response.put("role", role);

            System.out.println("Registration successful for: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Registration failed. Check backend logs.");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            if (email == null || password == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Missing email or password");
                return ResponseEntity.badRequest().body(error);
            }

            UserEntity user = userRepository.findByEmail(email).orElse(null);

            if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid credentials");
                return ResponseEntity.badRequest().body(error);
            }

            Map<String, Object> claims = new HashMap<>();
            claims.put("email", user.getEmail());
            claims.put("role", user.getRole());

            String token = jwtService.generateToken(claims, user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("role", user.getRole());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Login failed. Check backend logs.");
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
