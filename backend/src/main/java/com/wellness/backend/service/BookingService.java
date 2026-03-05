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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ReminderService reminderService;

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

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getClientUpcomingBookings(Long clientId) {
        LocalDateTime now = LocalDateTime.now();
        List<BookingStatus> excluded = List.of(BookingStatus.COMPLETED, BookingStatus.NOT_COMPLETED);

        return bookingRepository.findUpcomingBookingsByUser(clientId, now, excluded).stream()
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

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getPractitionerUpcomingBookings(Long practitionerId) {
        LocalDateTime now = LocalDateTime.now();
        List<BookingStatus> excluded = List.of(BookingStatus.COMPLETED, BookingStatus.NOT_COMPLETED);

        return bookingRepository.findUpcomingBookingsByPractitioner(practitionerId, now, excluded).stream()
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
        booking.setStatus(BookingStatus.CONFIRMED);
        BookingEntity saved = bookingRepository.save(booking);
        // Notify patient via in-app + email
        notificationService.notifyBookingAcceptedForClient(saved);
        try {
            emailService.sendBookingConfirmedToClient(saved);
            reminderService.scheduleBookingReminders(saved);
        } catch (Exception e) {
            log.error("Failed to send booking confirmation/reminder for booking {}: {}", id, e.getMessage());
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

    /** Patient/Practitioner cancels a pending/accepted booking */
    public BookingResponseDTO cancelBooking(Long id, String cancellerEmail) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        UserEntity canceller = userRepository.findByEmail(cancellerEmail)
                .orElseThrow(() -> new RuntimeException("Canceller not found"));

        booking.setStatus(BookingStatus.CANCELLED);
        BookingEntity saved = bookingRepository.save(booking);

        // Notify the other party
        try {
            notificationService.notifyBookingCancelled(saved, canceller);
            emailService.sendBookingCancelledEmail(saved, canceller);
            reminderService.cancelBookingReminders(saved.getId());
        } catch (Exception e) {
            log.error("Failed to send cancellation notification for booking {}: {}", id, e.getMessage());
        }

        return mapToResponseDTO(saved);
    }

    /** Patient accepts a reschedule suggested by the practitioner */
    public BookingResponseDTO acceptReschedule(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getStatus() != BookingStatus.RESCHEDULED) {
            throw new IllegalStateException("Booking is not in RESCHEDULED state");
        }
        booking.setStatus(BookingStatus.CONFIRMED);
        BookingEntity saved = bookingRepository.save(booking);
        // Notify patient of acceptance
        notificationService.notifyBookingAcceptedForClient(saved);
        try {
            emailService.sendBookingConfirmedToClient(saved);
            reminderService.scheduleBookingReminders(saved);
        } catch (Exception e) {
            log.error("Failed to send reschedule confirmation/reminder for booking {}: {}", id, e.getMessage());
        }
        return mapToResponseDTO(saved);
    }

    public BookingResponseDTO completeBooking(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING_COMPLETION_ACTION
                && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Booking can only be completed if it is in PENDING_COMPLETION_ACTION or CONFIRMED state. Current status: "
                            + booking.getStatus());
        }

        booking.setStatus(BookingStatus.COMPLETED);
        BookingEntity saved = bookingRepository.save(booking);

        // Notify both parties
        notificationService.notifyBookingCompleted(saved);
        try {
            emailService.sendBookingCompletedEmail(saved);
        } catch (Exception e) {
            log.error("Failed to send booking completed emails for booking {}: {}", id, e.getMessage());
        }

        return mapToResponseDTO(saved);
    }

    public BookingResponseDTO markBookingNotCompleted(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING_COMPLETION_ACTION
                && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Booking can only be marked as NOT_COMPLETED if it is in PENDING_COMPLETION_ACTION or CONFIRMED state. Current status: "
                            + booking.getStatus());
        }

        booking.setStatus(BookingStatus.NOT_COMPLETED);
        booking.setRefunded(true);
        BookingEntity saved = bookingRepository.save(booking);

        // Notify both parties
        notificationService.notifyBookingNotCompleted(saved);
        try {
            emailService.sendBookingNotCompletedEmail(saved);
        } catch (Exception e) {
            log.error("Failed to send booking not completed emails for booking {}: {}", id, e.getMessage());
        }

        return mapToResponseDTO(saved);
    }

    public List<BookingResponseDTO> getPractitionerHistory(Long practitionerId) {
        return bookingRepository.findByPractitioner_Id(practitionerId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getPractitionerSessionHistory(Long practitionerId) {
        LocalDateTime now = LocalDateTime.now();
        // Strictly follow logic: status = COMPLETED and time passed
        return bookingRepository.findByPractitioner_IdAndStatus(practitionerId, BookingStatus.COMPLETED).stream()
                .filter(b -> b.getBookingDate().isBefore(now))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getClientHistory(Long clientId) {
        return bookingRepository.findByUser_Id(clientId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Finds confirmed bookings that have passed and moves them to
     * PENDING_COMPLETION_ACTION
     */
    @Transactional
    public void autoProcessSessionCompletion() {
        LocalDateTime nowIst = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
        List<BookingEntity> stale = bookingRepository.findStaleConfirmedBookings(nowIst);

        if (!stale.isEmpty()) {
            log.info("⏳ Auto-completing {} stale bookings to PENDING_COMPLETION_ACTION...", stale.size());
            for (BookingEntity booking : stale) {
                booking.setStatus(BookingStatus.PENDING_COMPLETION_ACTION);
                bookingRepository.save(booking);
                // Optional: notify practitioner that they need to confirm completion
            }
        }
    }

    /**
     * Runs every 5 mins from scheduler. Sends reminders for sessions starting in
     * 30-35 mins.
     */
    @Transactional
    public void processSessionReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<BookingEntity> candidates = bookingRepository
                .findByStatusInAndReminderSentFalse(List.of(BookingStatus.CONFIRMED, BookingStatus.ACCEPTED));

        log.info("🔍 Checking {} bookings for in-app reminders...", candidates.size());

        for (BookingEntity booking : candidates) {
            if (isReminderDue(booking, now)) {
                try {
                    log.info("📩 Sending in-app reminder for booking ID: {}", booking.getId());
                    // Email is now handled by persistent SendGrid scheduler
                    notificationService.notifyBookingReminder(booking);
                    booking.setReminderSent(true);
                    bookingRepository.save(booking);
                } catch (Exception e) {
                    log.error("❌ Failed to send in-app reminder for booking {}: {}", booking.getId(), e.getMessage());
                }
            }
        }
    }

    private boolean isReminderDue(BookingEntity booking, LocalDateTime now) {
        LocalDateTime start = booking.getBookingDate();
        if (start == null)
            return false;

        // Use IST (Asia/Kolkata) to match ReminderService.calculateEpoch() timezone.
        LocalDateTime nowIst = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));

        // Due if session starts within the next 30 minutes (with up to 5 mins grace for
        // scheduler lag)
        boolean due = start.isAfter(nowIst.minusMinutes(5)) && start.isBefore(nowIst.plusMinutes(30));
        if (!due) {
            log.debug("⏭ Skipping booking ID {} — not yet in reminder window (start={}, now={})",
                    booking.getId(), start, nowIst);
        }
        return due;
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
            int duration = entity.getDuration() != null ? entity.getDuration() : 60;
            dto.setEndTime(entity.getBookingDate().plusMinutes(duration).toLocalTime().toString());
        }
        dto.setDuration(entity.getDuration());
        dto.setNotes(entity.getNotes());
        dto.setPractitionerComment(entity.getPractitionerComment());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setSessionFee(entity.getSessionFee());
        dto.setRefunded(entity.isRefunded());

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
                    .sessionFee(p.getSessionFee())
                    .build();

            dto.setPractitioner(practitionerDto);
        }

        return dto;
    }
}
