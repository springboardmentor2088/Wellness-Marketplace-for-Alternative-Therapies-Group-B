package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long orderId;
    private String productName;
    private String productImage;
    private Double price;
    private Integer quantity;
    private Double totalAmount;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private String deliveryStatus;
    private String status;
}
