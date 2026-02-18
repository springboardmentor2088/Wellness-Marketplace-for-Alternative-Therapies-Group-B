package com.wellness.backend.controller;

import com.wellness.backend.model.BookingEntity;
import com.wellness.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingRepository bookingRepository;

    @PostMapping
    public ResponseEntity<BookingEntity> createBooking(@RequestBody BookingEntity booking) {
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus("PENDING");
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingEntity>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingRepository.findByUserId(userId));
    }

    @GetMapping("/practitioner/{practitionerId}")
    public ResponseEntity<List<BookingEntity>> getPractitionerBookings(@PathVariable Long practitionerId) {
        return ResponseEntity.ok(bookingRepository.findByPractitionerId(practitionerId));
    }
}
