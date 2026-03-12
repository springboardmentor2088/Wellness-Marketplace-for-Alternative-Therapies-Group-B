package com.wellness.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "session_bookings", indexes = {
        @Index(name = "idx_session_provider", columnList = "provider_id"),
        @Index(name = "idx_session_client", columnList = "client_id"),
        @Index(name = "idx_session_date", columnList = "session_date"),
        @Index(name = "idx_session_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionBookingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private UserEntity client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false)
    private UserEntity provider;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer duration; // minutes

    @Column(name = "issue_description", columnDefinition = "TEXT", nullable = false)
    private String issueDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private SessionStatus status;

    @Column(name = "provider_message", columnDefinition = "TEXT")
    private String providerMessage;

    @Column(name = "reminder_sent", nullable = false)
    private boolean reminderSent = false;

    @Column(name = "refunded", nullable = false)
    private boolean refunded = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
