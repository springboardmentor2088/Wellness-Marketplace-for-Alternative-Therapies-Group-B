package com.wellness.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "provider_availability", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "provider_id", "available_date", "start_time", "end_time" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProviderAvailabilityEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private UserEntity provider;

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_blocked", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean isBlocked = false;

    @Column(name = "date_status")
    private String dateStatus; // GREEN, YELLOW
}
