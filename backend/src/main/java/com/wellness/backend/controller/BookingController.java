package com.wellness.backend.controller;

import com.wellness.backend.dto.BookingRequestDTO;
import com.wellness.backend.dto.BookingResponseDTO;
import com.wellness.backend.model.BookingStatus;
import com.wellness.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponseDTO>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getClientUpcomingBookings(userId));
    }

    /**
     * Patient Calendar: returns only ACCEPTED / CONFIRMED / RESCHEDULED bookings
     */
    @GetMapping("/user/{userId}/calendar")
    public ResponseEntity<List<BookingResponseDTO>> getClientCalendarBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getClientCalendarBookings(userId));
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@RequestBody BookingRequestDTO request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<BookingResponseDTO>> getClientUpcomingBookings(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getClientUpcomingBookings(clientId));
    }

    @GetMapping("/practitioner/{practitionerId}")
    public ResponseEntity<List<BookingResponseDTO>> getPractitionerUpcomingBookings(
            @PathVariable Long practitionerId,
            @RequestParam(name = "status", required = false) BookingStatus status) {
        if (status != null) {
            return ResponseEntity.ok(bookingService.getPractitionerBookingsByStatus(practitionerId, status));
        }
        return ResponseEntity.ok(bookingService.getPractitionerUpcomingBookings(practitionerId));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<BookingResponseDTO> acceptBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.acceptBooking(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponseDTO> rejectBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.rejectBooking(id));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<BookingResponseDTO> rescheduleBooking(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> data) {
        String newSessionDate = data.get("newSessionDate");
        String newStartTime = data.get("newStartTime");
        return ResponseEntity.ok(bookingService.rescheduleBooking(id, newSessionDate, newStartTime));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<BookingResponseDTO> completeBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.completeBooking(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @PutMapping("/{id}/accept-reschedule")
    public ResponseEntity<BookingResponseDTO> acceptReschedule(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.acceptReschedule(id));
    }
}