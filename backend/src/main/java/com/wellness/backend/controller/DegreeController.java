package com.wellness.backend.controller;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class DegreeController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/uploadDegree")
    public ResponseEntity<?> uploadDegree(@RequestParam("file") MultipartFile file,
                                          @RequestParam("userId") Long userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String fileName = user.getId() + "_degree.pdf";
            Path path = Paths.get("uploads/degrees/" + fileName);
            Files.createDirectories(path.getParent()); // Ensure folder exists
            Files.write(path, file.getBytes());

            user.setDegreeFile(fileName);
            userRepository.save(user);

            return ResponseEntity.ok(Collections.singletonMap("message", "Degree uploaded"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
