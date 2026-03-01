package com.wellness.backend.service;

import com.wellness.backend.dto.BookingRequestDTO;
import com.wellness.backend.dto.BookingResponseDTO;
import com.wellness.backend.exception.BookingConflictException;
import com.wellness.backend.model.BookingEntity;
import com.wellness.backend.model.BookingStatus;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.BookingRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        // Validate bookingDate is in the future
        if (request.getBookingDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Booking date must be in the future");
        }

        // Check for conflicts
        if (bookingRepository.existsByPractitioner_IdAndBookingDate(request.getPractitionerId(),
                request.getBookingDate())) {
            throw new BookingConflictException("This time slot is already booked.");
        }

        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserEntity practitioner = userRepository.findById(request.getPractitionerId())
                .orElseThrow(() -> new RuntimeException("Practitioner not found"));

        BookingEntity booking = new BookingEntity();
        booking.setUser(user);
        booking.setPractitioner(practitioner);
        booking.setBookingDate(request.getBookingDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setReminderSent(false);
        booking.setNotes(request.getNotes());

        BookingEntity saved = bookingRepository.save(booking);
        notificationService.notifyBookingRequest(saved);
        return mapToResponseDTO(saved);
    }

    public List<BookingResponseDTO> getClientUpcomingBookings(Long clientId) {
        return bookingRepository.findByUser_Id(clientId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /** Returns patient bookings filtered to calendar-relevant statuses only. */
    public List<BookingResponseDTO> getClientCalendarBookings(Long clientId) {
        return bookingRepository.findByUser_IdAndStatusIn(
                clientId,
                List.of(BookingStatus.ACCEPTED, BookingStatus.CONFIRMED, BookingStatus.RESCHEDULED)).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getPractitionerUpcomingBookings(Long practitionerId) {
        return bookingRepository.findByPractitioner_Id(practitionerId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getPractitionerBookingsByStatus(Long practitionerId, BookingStatus status) {
        return bookingRepository.findByPractitioner_IdAndStatus(practitionerId, status).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO acceptBooking(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.ACCEPTED);
        return mapToResponseDTO(bookingRepository.save(booking));
    }

    public BookingResponseDTO rejectBooking(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.REJECTED);
        return mapToResponseDTO(bookingRepository.save(booking));
    }

    public BookingResponseDTO rescheduleBooking(Long id, String newSessionDate, String newStartTime) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.RESCHEDULED);
        try {
            // Check if length is 5 e.g. "09:00", append ":00" to make it parseable
            String timeString = newStartTime;
            if (timeString != null && timeString.length() == 5) {
                timeString += ":00";
            }
            LocalDateTime newBookingDate = LocalDateTime.parse(newSessionDate + "T" + timeString);
            booking.setBookingDate(newBookingDate);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date or time format. Expected yyyy-MM-dd and HH:mm");
        }
        return mapToResponseDTO(bookingRepository.save(booking));
    }

    private BookingResponseDTO mapToResponseDTO(BookingEntity entity) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        if (entity.getUser() != null) {
            dto.setClientName(entity.getUser().getName());
        }
        dto.setPractitionerId(entity.getPractitioner().getId());
        dto.setBookingDate(entity.getBookingDate());
        dto.setNotes(entity.getNotes());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setSessionFee(entity.getSessionFee());
        return dto;
    }
}
