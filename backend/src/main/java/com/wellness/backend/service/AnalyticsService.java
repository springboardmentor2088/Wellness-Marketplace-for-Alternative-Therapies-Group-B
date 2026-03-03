package com.wellness.backend.service;

import com.wellness.backend.dto.*;
import com.wellness.backend.model.BookingStatus;
import com.wellness.backend.repository.BookingRepository;
import com.wellness.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

        private final BookingRepository bookingRepository;
        private final OrderRepository orderRepository;

        public PractitionerAnalyticsDTO getPractitionerAnalytics(Long practitionerId) {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime todayStart = now.with(LocalTime.MIN);
                LocalDateTime yesterdayStart = todayStart.minusDays(1);

                LocalDateTime weekStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                                .with(LocalTime.MIN);
                LocalDateTime prevWeekStart = weekStart.minusWeeks(1);

                LocalDateTime monthStart = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
                LocalDateTime prevMonthStart = monthStart.minusMonths(1);

                LocalDateTime yearStart = now.with(TemporalAdjusters.firstDayOfYear()).with(LocalTime.MIN);
                LocalDateTime prevYearStart = yearStart.minusYears(1);

                // Daily
                BigDecimal sessionToday = orZero(
                                bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId,
                                                todayStart, now));
                BigDecimal productToday = orZero(
                                orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, todayStart,
                                                now));
                BigDecimal totalToday = sessionToday.add(productToday);

                BigDecimal sessionYesterday = orZero(bookingRepository
                                .sumSessionRevenueByPractitionerAndDateRange(practitionerId, yesterdayStart,
                                                todayStart));
                BigDecimal productYesterday = orZero(
                                orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, yesterdayStart,
                                                todayStart));
                BigDecimal totalYesterday = sessionYesterday.add(productYesterday);

                // Weekly
                BigDecimal sessionThisWeek = orZero(
                                bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, weekStart,
                                                now));
                BigDecimal productThisWeek = orZero(
                                orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, weekStart,
                                                now));
                BigDecimal totalThisWeek = sessionThisWeek.add(productThisWeek);

                BigDecimal sessionPrevWeek = orZero(bookingRepository
                                .sumSessionRevenueByPractitionerAndDateRange(practitionerId, prevWeekStart, weekStart));
                BigDecimal productPrevWeek = orZero(
                                orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, prevWeekStart,
                                                weekStart));
                BigDecimal totalPrevWeek = sessionPrevWeek.add(productPrevWeek);

                // Monthly
                BigDecimal sessionThisMonth = orZero(
                                bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId,
                                                monthStart, now));
                BigDecimal productThisMonth = orZero(
                                orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, monthStart,
                                                now));
                BigDecimal totalThisMonth = sessionThisMonth.add(productThisMonth);

                BigDecimal sessionPrevMonth = orZero(bookingRepository
                                .sumSessionRevenueByPractitionerAndDateRange(practitionerId, prevMonthStart,
                                                monthStart));
                BigDecimal productPrevMonth = orZero(
                                orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, prevMonthStart,
                                                monthStart));
                BigDecimal totalPrevMonth = sessionPrevMonth.add(productPrevMonth);

                // Yearly
                BigDecimal sessionThisYear = orZero(
                                bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, yearStart,
                                                now));
                BigDecimal productThisYear = orZero(
                                orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, yearStart,
                                                now));
                BigDecimal totalThisYear = sessionThisYear.add(productThisYear);

                BigDecimal sessionPrevYear = orZero(bookingRepository
                                .sumSessionRevenueByPractitionerAndDateRange(practitionerId, prevYearStart, yearStart));
                BigDecimal productPrevYear = orZero(
                                orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, prevYearStart,
                                                yearStart));
                BigDecimal totalPrevYear = sessionPrevYear.add(productPrevYear);

                // All Time
                BigDecimal totalSessionAllTime = orZero(
                                bookingRepository.sumTotalSessionRevenueByPractitioner(practitionerId));
                BigDecimal totalProductAllTime = orZero(
                                orderRepository.sumTotalProductRevenueByProvider(practitionerId));
                BigDecimal totalAllTime = totalSessionAllTime.add(totalProductAllTime);

                return PractitionerAnalyticsDTO.builder()
                                .dailyRevenue(orZero(totalToday))
                                .weeklyRevenue(orZero(totalThisWeek))
                                .monthlyRevenue(orZero(totalThisMonth))
                                .yearlyRevenue(orZero(totalThisYear))
                                .allTimeRevenue(orZero(totalAllTime))
                                .dailyGrowthPercent(calculateGrowth(totalToday, totalYesterday))
                                .weeklyGrowthPercent(calculateGrowth(totalThisWeek, totalPrevWeek))
                                .monthlyGrowthPercent(calculateGrowth(totalThisMonth, totalPrevMonth))
                                .yearlyGrowthPercent(calculateGrowth(totalThisYear, totalPrevYear))
                                .sessionRevenueDaily(orZero(sessionToday))
                                .productRevenueDaily(orZero(productToday))
                                .sessionRevenueMonthly(orZero(sessionThisMonth))
                                .productRevenueMonthly(orZero(productThisMonth))
                                .sessionRevenueAllTime(orZero(totalSessionAllTime))
                                .productRevenueAllTime(orZero(totalProductAllTime))
                                .totalSessionRevenue(orZero(totalSessionAllTime))
                                .totalProductRevenue(orZero(totalProductAllTime))
                                .accumulatedRevenue(orZero(totalAllTime))
                                .build();
        }

        public PatientAnalyticsDTO getPatientAnalytics(Long userId) {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime monthStart = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
                LocalDateTime yearStart = now.with(TemporalAdjusters.firstDayOfYear()).with(LocalTime.MIN);

                long sessionsAttended = bookingRepository.countByUser_IdAndStatusIn(userId,
                                List.of(BookingStatus.ACCEPTED, BookingStatus.CONFIRMED, BookingStatus.RESCHEDULED,
                                                BookingStatus.COMPLETED, BookingStatus.PENDING_COMPLETION_ACTION));
                BigDecimal totalSessionSpent = orZero(bookingRepository.sumTotalSessionSpentByPatient(userId));
                BigDecimal totalProductSpent = orZero(orderRepository.sumTotalProductSpentByPatient(userId));
                BigDecimal totalSpent = totalSessionSpent.add(totalProductSpent);

                BigDecimal sessionThisMonth = orZero(
                                bookingRepository.sumSessionSpentByPatientAndDateRange(userId, monthStart, now));
                BigDecimal productThisMonth = orZero(
                                orderRepository.sumProductSpentByPatientAndDateRange(userId, monthStart, now));
                BigDecimal monthlySpent = sessionThisMonth.add(productThisMonth);

                BigDecimal sessionThisYear = orZero(
                                bookingRepository.sumSessionSpentByPatientAndDateRange(userId, yearStart, now));
                BigDecimal productThisYear = orZero(
                                orderRepository.sumProductSpentByPatientAndDateRange(userId, yearStart, now));
                BigDecimal yearlySpent = sessionThisYear.add(productThisYear);

                List<BookingResponseDTO> recentSessions = bookingRepository
                                .findTop5ByUser_IdOrderByBookingDateDesc(userId)
                                .stream().map(this::mapToBookingDTO).collect(Collectors.toList());

                List<OrderDTO> recentOrders = orderRepository.findTop5ByUser_IdOrderByOrderDateDesc(userId)
                                .stream().map(this::mapToOrderDTO).collect(Collectors.toList());

                return PatientAnalyticsDTO.builder()
                                .sessionsAttended(sessionsAttended)
                                .totalSessionSpent(totalSessionSpent)
                                .totalProductSpent(totalProductSpent)
                                .totalSpent(totalSpent)
                                .monthlySpent(monthlySpent)
                                .yearlySpent(yearlySpent)
                                .recentSessions(recentSessions)
                                .recentOrders(recentOrders)
                                .build();
        }

        private BigDecimal orZero(BigDecimal val) {
                return val == null ? BigDecimal.ZERO : val;
        }

        private Double calculateGrowth(BigDecimal current, BigDecimal previous) {
                if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
                        return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
                }
                return current.subtract(previous)
                                .divide(previous, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .doubleValue();
        }

        private BookingResponseDTO mapToBookingDTO(com.wellness.backend.model.BookingEntity b) {
                BookingResponseDTO dto = new BookingResponseDTO();
                dto.setId(b.getId());
                dto.setUserId(b.getUser().getId());
                dto.setClientName(b.getUser().getName());
                dto.setBookingDate(b.getBookingDate());
                if (b.getBookingDate() != null) {
                        dto.setStartTime(b.getBookingDate().toLocalTime().toString());
                }
                dto.setDuration(b.getDuration());
                dto.setStatus(b.getStatus().name());
                dto.setNotes(b.getNotes());
                dto.setPractitionerComment(b.getPractitionerComment());
                dto.setSessionFee(b.getSessionFee());

                if (b.getPractitioner() != null) {
                        String profileImg = b.getPractitioner().getProfileImage();
                        if (profileImg != null && !profileImg.startsWith("http")) {
                                profileImg = "http://localhost:8080/uploads/" + profileImg;
                        }
                        dto.setPractitioner(UserDTO.builder()
                                        .id(b.getPractitioner().getId())
                                        .fullName(b.getPractitioner().getName())
                                        .specialization(b.getPractitioner().getSpecialization())
                                        .profileImage(profileImg)
                                        .build());
                }
                return dto;
        }

        private OrderDTO mapToOrderDTO(com.wellness.backend.model.OrderEntity o) {
                OrderDTO dto = new OrderDTO();
                dto.setOrderId(o.getOrderId());
                dto.setProductName(o.getProduct().getName());
                dto.setProductImage(o.getProduct().getImageUrl());
                dto.setPrice(o.getProduct().getPrice().doubleValue());
                dto.setQuantity(o.getQuantity());
                dto.setTotalAmount(o.getTotalPrice().doubleValue());
                dto.setOrderDate(o.getOrderDate());
                dto.setDeliveryStatus(o.getDeliveryStatus());
                return dto;
        }
}
