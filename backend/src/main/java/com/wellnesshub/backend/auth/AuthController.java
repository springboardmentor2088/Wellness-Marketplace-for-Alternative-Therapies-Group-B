package com.wellnesshub.backend.auth;

import com.wellnesshub.backend.security.JwtService;
import com.wellnesshub.backend.user.UserEntity;
import com.wellnesshub.backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            JwtService jwtService,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");
        String name = request.get("name");
        String role = request.get("role");

        if (email == null || password == null || name == null || role == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Missing required fields");
            return ResponseEntity.badRequest().body(error);
        }

        if (userRepository.findByEmail(email).isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Email already exists");
            return ResponseEntity.badRequest().body(error);
        }

        UserEntity user = new UserEntity();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        userRepository.save(user);

        // ✅ Wrap claims in a Map
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("role", role);

        String token = jwtService.generateToken(claims, email);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration successful");
        response.put("token", token);
        response.put("role", role);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {

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

        // ✅ Wrap claims in a Map
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
    }
}
