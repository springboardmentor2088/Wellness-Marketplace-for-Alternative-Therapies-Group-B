package com.wellness.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingResponseDTO {
    private Long id;
    private Long userId;
    private String clientName;
    private Long practitionerId;
    private LocalDateTime bookingDate;
    private String notes;
    private String status;
    private java.math.BigDecimal sessionFee;
}
