package com.wellness.backend.controller;

import com.wellness.backend.dto.OrderDTO;
import com.wellness.backend.dto.OrderRequestDTO;
import com.wellness.backend.dto.PractitionerStatsDTO;
import com.wellness.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(orderService.getOrdersByProviderId(providerId));
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(Principal principal, @RequestBody OrderRequestDTO request) {
        return ResponseEntity.ok(orderService.createOrder(principal.getName(), request));
    }

    @GetMapping("/practitioner/{providerId}/stats")
    public ResponseEntity<PractitionerStatsDTO> getPractitionerStats(@PathVariable Long providerId) {
        return ResponseEntity.ok(orderService.getPractitionerStats(providerId));
    }
}
