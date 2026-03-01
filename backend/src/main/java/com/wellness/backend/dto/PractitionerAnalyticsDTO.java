package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PractitionerAnalyticsDTO {
    private BigDecimal dailyRevenue;
    private BigDecimal weeklyRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal yearlyRevenue;
    private BigDecimal allTimeRevenue;

    private Double dailyGrowthPercent;
    private Double weeklyGrowthPercent;
    private Double monthlyGrowthPercent;
    private Double yearlyGrowthPercent;

    private BigDecimal sessionRevenueDaily;
    private BigDecimal productRevenueDaily;
    private BigDecimal sessionRevenueMonthly;
    private BigDecimal productRevenueMonthly;
    private BigDecimal sessionRevenueAllTime;
    private BigDecimal productRevenueAllTime;

    private BigDecimal totalSessionRevenue;
    private BigDecimal totalProductRevenue;
    private BigDecimal accumulatedRevenue;
}
