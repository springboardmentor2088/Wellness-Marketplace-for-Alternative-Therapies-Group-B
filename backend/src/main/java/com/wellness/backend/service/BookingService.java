package com.wellness.backend.service;

import com.wellness.backend.dto.BookingRequestDTO;
import com.wellness.backend.dto.BookingResponseDTO;
import com.wellness.backend.dto.UserDTO;
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
    private final EmailService emailService;

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
        booking.setNotes(request.getNotes());
        booking.setStatus(BookingStatus.PENDING);
        booking.setSessionFee(practitioner.getSessionFee() != null ? practitioner.getSessionFee()
                : java.math.BigDecimal.valueOf(500.0));
        booking.setCreatedAt(LocalDateTime.now());
        booking.setReminderSent(false);
        booking.setNotes(request.getNotes());

        BookingEntity saved = bookingRepository.save(booking);
        notificationService.notifyBookingRequest(saved);
        // Email the patient confirming the booking request was received
        try {
            emailService.sendBookingReceivedToClient(saved);
        } catch (Exception ignored) {
        }
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
        BookingEntity saved = bookingRepository.save(booking);
        // Notify patient via in-app + email
        notificationService.notifyBookingAcceptedForClient(saved);
        try {
            emailService.sendBookingConfirmedToClient(saved);
        } catch (Exception ignored) {
        }
        return mapToResponseDTO(saved);
    }

    public BookingResponseDTO rejectBooking(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.REJECTED);
        BookingEntity saved = bookingRepository.save(booking);
        // Notify patient via in-app + email
        notificationService.notifyBookingRejectedForClient(saved);
        try {
            emailService.sendBookingRejectedToClient(saved);
        } catch (Exception ignored) {
        }
        return mapToResponseDTO(saved);
    }

    public BookingResponseDTO rescheduleBooking(Long id, String newSessionDate, String newStartTime) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.RESCHEDULED);
        try {
            String timeString = newStartTime;
            if (timeString != null && timeString.length() == 5) {
                timeString += ":00";
            }
            LocalDateTime newBookingDate = LocalDateTime.parse(newSessionDate + "T" + timeString);
            booking.setBookingDate(newBookingDate);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date or time format. Expected yyyy-MM-dd and HH:mm");
        }
        BookingEntity saved = bookingRepository.save(booking);
        // Notify patient via in-app + email
        notificationService.notifyBookingRescheduledForClient(saved);
        try {
            emailService.sendRescheduleSuggestedToClient(saved);
        } catch (Exception ignored) {
        }
        return mapToResponseDTO(saved);
    }

    /** Patient cancels a pending/accepted booking */
    public BookingResponseDTO cancelBooking(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.CANCELLED);
        return mapToResponseDTO(bookingRepository.save(booking));
    }

    /** Patient accepts a reschedule suggested by the practitioner */
    public BookingResponseDTO acceptReschedule(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getStatus() != BookingStatus.RESCHEDULED) {
            throw new IllegalStateException("Booking is not in RESCHEDULED state");
        }
        booking.setStatus(BookingStatus.ACCEPTED);
        BookingEntity saved = bookingRepository.save(booking);
        // Notify patient of acceptance
        notificationService.notifyBookingAcceptedForClient(saved);
        try {
            emailService.sendBookingConfirmedToClient(saved);
        } catch (Exception ignored) {
        }
        return mapToResponseDTO(saved);
    }

    public BookingResponseDTO completeBooking(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.COMPLETED);
        return mapToResponseDTO(bookingRepository.save(booking));
    }

    public List<BookingResponseDTO> getPractitionerSessionHistory(Long practitionerId) {
        LocalDateTime now = LocalDateTime.now();
        // Strictly follow logic: status = COMPLETED and time passed
        return bookingRepository.findByPractitioner_IdAndStatus(practitionerId, BookingStatus.COMPLETED).stream()
                .filter(b -> b.getBookingDate().isBefore(now))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Runs every 5 mins from scheduler. Sends reminders for sessions starting in
     * 30-35 mins.
     */
    public void processSessionReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<BookingEntity> candidates = bookingRepository
                .findByStatusAndReminderSentFalse(BookingStatus.ACCEPTED);

        for (BookingEntity booking : candidates) {
            if (isWithinExact30MinuteWindow(booking, now)) {
                try {
                    sendReminderEmails(booking);
                    notificationService.notifyBookingReminder(booking);
                    booking.setReminderSent(true);
                    bookingRepository.save(booking);
                } catch (Exception e) {
                    System.err
                            .println("Failed to send reminder for booking " + booking.getId() + ": " + e.getMessage());
                }
            }
        }
    }

    private boolean isWithinExact30MinuteWindow(BookingEntity booking, LocalDateTime now) {
        LocalDateTime start = booking.getBookingDate();
        if (start == null)
            return false;
        long minutesDiff = java.time.temporal.ChronoUnit.MINUTES.between(now, start);
        return minutesDiff >= 30 && minutesDiff < 35;
    }

    private void sendReminderEmails(BookingEntity booking) {
        try {
            emailService.sendSessionReminderToClient(booking);
        } catch (Exception ignored) {
        }
        try {
            emailService.sendSessionReminderToProvider(booking);
        } catch (Exception ignored) {
        }
    }

    private BookingResponseDTO mapToResponseDTO(BookingEntity entity) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        if (entity.getUser() != null) {
            dto.setClientName(entity.getUser().getName());
            dto.setClientEmail(entity.getUser().getEmail());
        }

        dto.setBookingDate(entity.getBookingDate());
        if (entity.getBookingDate() != null) {
            dto.setStartTime(entity.getBookingDate().toLocalTime().toString());
        }
        dto.setDuration(entity.getDuration());
        dto.setNotes(entity.getNotes());
        dto.setPractitionerComment(entity.getPractitionerComment());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setSessionFee(entity.getSessionFee());

        if (entity.getPractitioner() != null) {
            UserEntity p = entity.getPractitioner();
            String profileImg = p.getProfileImage();
            if (profileImg != null && !profileImg.startsWith("http")) {
                profileImg = "http://localhost:8080/uploads/" + profileImg;
            }

            UserDTO practitionerDto = UserDTO.builder()
                    .id(p.getId())
                    .fullName(p.getName())
                    .specialization(p.getSpecialization())
                    .profileImage(profileImg)
                    .build();

            dto.setPractitioner(practitionerDto);
        }

        return dto;
    }
}
