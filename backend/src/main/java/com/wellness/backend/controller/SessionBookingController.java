package com.wellness.backend.controller;

import com.wellness.backend.dto.SessionBookingRequestDTO;
import com.wellness.backend.dto.SessionBookingResponseDTO;
import com.wellness.backend.dto.SessionRescheduleRequestDTO;
import com.wellness.backend.dto.SessionStatusUpdateDTO;
import com.wellness.backend.service.SessionBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SessionBookingController {

    private final SessionBookingService sessionBookingService;

    @PostMapping("/book")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<SessionBookingResponseDTO> bookSession(
            Principal principal,
            @Valid @RequestBody SessionBookingRequestDTO request) {
        return ResponseEntity.ok(sessionBookingService.bookSession(principal.getName(), request));
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<SessionBookingResponseDTO>> getSessionsForProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(sessionBookingService.getSessionsForProvider(providerId));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<SessionBookingResponseDTO>> getSessionsForClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(sessionBookingService.getSessionsForClient(clientId));
    }

    @GetMapping("/provider/{providerId}/history")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<SessionBookingResponseDTO>> getSessionsHistoryForProvider(
            @PathVariable Long providerId) {
        return ResponseEntity.ok(sessionBookingService.getSessionsHistoryForProvider(providerId));
    }

    @GetMapping("/client/{clientId}/history")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<SessionBookingResponseDTO>> getSessionsHistoryForClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(sessionBookingService.getSessionsHistoryForClient(clientId));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<SessionBookingResponseDTO> acceptSession(
            @PathVariable Long id,
            Principal principal,
            @RequestBody(required = false) SessionStatusUpdateDTO body) {
        return ResponseEntity.ok(sessionBookingService.acceptSession(id, principal.getName(), body));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<SessionBookingResponseDTO> rescheduleSession(
            @PathVariable Long id,
            Principal principal,
            @Valid @RequestBody SessionRescheduleRequestDTO body) {
        return ResponseEntity.ok(sessionBookingService.rescheduleSession(id, principal.getName(), body));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<SessionBookingResponseDTO> rejectSession(
            @PathVariable Long id,
            Principal principal,
            @RequestBody(required = false) SessionStatusUpdateDTO body) {
        return ResponseEntity.ok(sessionBookingService.rejectSession(id, principal.getName(), body));
    }

    @PutMapping("/{id}/confirm-reschedule")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<SessionBookingResponseDTO> confirmReschedule(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(sessionBookingService.confirmReschedule(id, principal.getName()));
    }

    @GetMapping("/upcoming-reminders")
    public ResponseEntity<List<SessionBookingResponseDTO>> getUpcomingReminders(Principal principal) {
        return ResponseEntity.ok(sessionBookingService.findUpcomingRemindersForUser(principal.getName()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<SessionBookingResponseDTO> cancelSession(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(sessionBookingService.cancelSession(id, principal.getName()));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<SessionBookingResponseDTO> completeSession(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(sessionBookingService.completeSession(id, principal.getName()));
    }

    @PutMapping("/{id}/not-complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<SessionBookingResponseDTO> markSessionNotCompleted(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(sessionBookingService.markSessionNotCompleted(id, principal.getName()));
    }
}
