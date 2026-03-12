package com.wellness.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequestDTO {
    private Long userId;
    private Long practitionerId;
    private LocalDateTime bookingDate;
    private String notes;
}
