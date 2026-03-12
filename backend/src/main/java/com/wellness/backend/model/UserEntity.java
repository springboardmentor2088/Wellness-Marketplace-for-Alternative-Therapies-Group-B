package com.wellness.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore // 🔥 NEVER expose password in API response
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

    @Column(name = "email_verified", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean emailVerified = false;

    @JsonIgnore
    @Column(name = "verification_token")
    private String verificationToken;

    @JsonIgnore
    @Column(name = "otp")
    private String otp;

    @JsonIgnore
    @Column(name = "otp_expiry")
    private java.time.LocalDateTime otpExpiry;

    @Column(name = "admin_comment", columnDefinition = "TEXT")
    private String adminComment;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "session_fee", precision = 19, scale = 2)
    private java.math.BigDecimal sessionFee = java.math.BigDecimal.valueOf(500.0);

    public boolean isVerified() {
        return "VERIFIED".equalsIgnoreCase(this.verificationStatus) ||
                "APPROVED".equalsIgnoreCase(this.verificationStatus) ||
                this.verified;
    }
}