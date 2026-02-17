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
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // CLIENT / PROVIDER / ADMIN

    @Column(nullable = true)
    private String specialization;

    @Column(nullable = true)
    private String city;

    @Column(nullable = true)
    private String country;

    @Column(nullable = true)
    private String degreeFile; // For practitioner degree uploads
}
