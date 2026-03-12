package com.wellness.backend.dto;

import com.wellness.backend.model.SessionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class SessionBookingResponseDTO {

    private Long id;
    private Long clientId;
    private String clientName;
    private String clientEmail;
    private Long providerId;
    private String providerName;
    private String providerSpecialization;
    private String providerProfileImage;

    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer duration;
    private String issueDescription;

    private SessionStatus status;
    private String providerMessage;
    private String dateStatusColor;

    private boolean reminderSent;
    private boolean refunded;
    private java.math.BigDecimal sessionFee;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
