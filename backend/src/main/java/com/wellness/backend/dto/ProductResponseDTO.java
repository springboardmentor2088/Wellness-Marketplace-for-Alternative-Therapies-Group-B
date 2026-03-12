package com.wellness.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductResponseDTO {
    private Long productId;
    private String name;
    private String description;
    private BigDecimal price;
    private Long providerId;
    private String imageUrl;
    private LocalDateTime createdAt;
}
