package com.wellness.backend.controller;

import com.wellness.backend.dto.PatientAnalyticsDTO;
import com.wellness.backend.dto.PractitionerAnalyticsDTO;
import com.wellness.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/practitioner/{id}")
    public ResponseEntity<PractitionerAnalyticsDTO> getPractitionerAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getPractitionerAnalytics(id));
    }

    @GetMapping("/patient/{id}")
    public ResponseEntity<PatientAnalyticsDTO> getPatientAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getPatientAnalytics(id));
    }
}
