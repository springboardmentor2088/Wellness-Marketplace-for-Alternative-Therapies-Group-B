package com.wellness.backend.service;

import com.wellness.backend.dto.OrderDTO;
import com.wellness.backend.dto.OrderRequestDTO;
import com.wellness.backend.dto.PractitionerStatsDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.OrderEntity;
import com.wellness.backend.model.ProductEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.OrderRepository;
import com.wellness.backend.repository.ProductRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;

        public List<OrderDTO> getOrdersByUserId(Long userId) {
                return orderRepository.findByUser_Id(userId).stream()
                                .map(this::toOrderDto)
                                .collect(Collectors.toList());
        }

        public List<OrderDTO> getOrdersByProviderId(Long providerId) {
                return orderRepository.findByProductProviderId(providerId).stream()
                                .map(this::toOrderDto)
                                .collect(Collectors.toList());
        }

        public OrderDTO createOrder(String userEmail, OrderRequestDTO request) {
                UserEntity user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

                ProductEntity product = productRepository.findById(request.getProductId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product not found: " + request.getProductId()));

                BigDecimal totalPrice = product.getPrice().multiply(new BigDecimal(request.getQuantity()));

                OrderEntity order = new OrderEntity();
                order.setUser(user);
                order.setProduct(product);
                order.setQuantity(request.getQuantity());
                order.setTotalPrice(totalPrice);
                order.setOrderDate(LocalDateTime.now());
                order.setStatus("PENDING");
                order.setDeliveryStatus("PROCESSING");
                order.setPatient(user);

                OrderEntity savedOrder = orderRepository.save(order);

                return toOrderDto(savedOrder);
        }

        public PractitionerStatsDTO getPractitionerStats(Long providerId) {
                List<OrderEntity> orders = orderRepository.findByProductProviderId(providerId);

                long totalOrders = orders.size();
                long totalProductsSold = orders.stream().mapToLong(OrderEntity::getQuantity).sum();
                double totalRevenue = orders.stream()
                                .mapToDouble(o -> o.getTotalPrice().doubleValue())
                                .sum();

                // Monthly revenue for the last 6 months (simplification or using order dates)
                Map<String, Double> monthlyRevenue = orders.stream()
                                .collect(Collectors.groupingBy(
                                                o -> o.getOrderDate().getMonth().getDisplayName(TextStyle.SHORT,
                                                                Locale.ENGLISH),
                                                LinkedHashMap::new,
                                                Collectors.summingDouble(o -> o.getTotalPrice().doubleValue())));

                return PractitionerStatsDTO.builder()
                                .totalOrders(totalOrders)
                                .totalProductsSold(totalProductsSold)
                                .totalRevenue(totalRevenue)
                                .monthlyRevenue(monthlyRevenue)
                                .build();
        }

        private OrderDTO toOrderDto(OrderEntity order) {
                LocalDateTime createdAt = order.getCreatedAt() != null ? order.getCreatedAt() : order.getOrderDate();
                LocalDateTime deliveryDate = createdAt.plusDays(3);
                String deliveryStatus = LocalDateTime.now().isAfter(deliveryDate) ? "DELIVERED" : "PROCESSING";

                String productImg = order.getProduct().getImageUrl();
                if (productImg != null && !productImg.startsWith("http")) {
                        productImg = "http://localhost:8080/" + productImg;
                }

                return OrderDTO.builder()
                                .orderId(order.getOrderId())
                                .productName(order.getProduct().getName())
                                .productImage(productImg)
                                .price(order.getProduct().getPrice().doubleValue())
                                .quantity(order.getQuantity())
                                .totalAmount(order.getTotalPrice().doubleValue())
                                .orderDate(order.getOrderDate())
                                .deliveryDate(deliveryDate)
                                .deliveryStatus(deliveryStatus)
                                .status(order.getStatus())
                                .build();
        }
}
