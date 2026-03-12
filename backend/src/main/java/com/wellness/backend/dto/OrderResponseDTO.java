package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {
    private Long orderId;
    private String userEmail;
    private String productName;
    private Integer quantity;
    private BigDecimal totalPrice;
    private LocalDateTime orderDate;
    private String status;
    private String deliveryStatus;
}
