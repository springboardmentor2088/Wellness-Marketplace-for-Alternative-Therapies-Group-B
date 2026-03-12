package com.wellness.backend.dto;

import com.wellness.backend.model.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private NotificationType type;
    private String message;
    private boolean read;
    private Long relatedBookingId;
    private LocalDateTime createdAt;
}

