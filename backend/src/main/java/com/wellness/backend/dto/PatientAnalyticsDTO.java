package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAnalyticsDTO {
    private Long sessionsAttended;
    private BigDecimal totalSessionSpent;
    private BigDecimal totalProductSpent;
    private BigDecimal totalSpent;

    private BigDecimal monthlySpent;
    private BigDecimal yearlySpent;

    private List<BookingResponseDTO> recentSessions;
    private List<OrderDTO> recentOrders;
}
