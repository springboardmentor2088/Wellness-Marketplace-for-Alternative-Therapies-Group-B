package com.wellness.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Use getName() instead of getFullName()

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // CLIENT / PROVIDER / ADMIN

    private String specialization;
    private String city;
    private String country;

    @Column(name = "degree_file")
    private String degreeFile;

    @Column(name = "verification_status")
    private String verificationStatus = "PENDING";

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean verified = false;

    // Optional helper methods (if needed for UserService)
    public boolean isVerified() {
        return "VERIFIED".equalsIgnoreCase(this.verificationStatus) || this.verified;
    }
}
