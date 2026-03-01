package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PractitionerStatsDTO {
    private Long totalOrders;
    private Long totalProductsSold;
    private Double totalRevenue;
    private Map<String, Double> monthlyRevenue;
}
