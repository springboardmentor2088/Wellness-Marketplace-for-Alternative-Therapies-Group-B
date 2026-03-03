package com.wellness.backend.service;

import com.wellness.backend.dto.SessionBookingRequestDTO;
import com.wellness.backend.dto.SessionBookingResponseDTO;
import com.wellness.backend.dto.SessionRescheduleRequestDTO;
import com.wellness.backend.dto.SessionStatusUpdateDTO;
import com.wellness.backend.exception.ForbiddenActionException;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.SessionBookingEntity;
import com.wellness.backend.model.SessionStatus;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.ProviderAvailabilityRepository;
import com.wellness.backend.repository.SessionBookingRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionBookingService {

    private final SessionBookingRepository sessionBookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final ProviderAvailabilityRepository providerAvailabilityRepository;

    @Transactional
    public SessionBookingResponseDTO bookSession(String clientEmail, SessionBookingRequestDTO request) {
        UserEntity client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientEmail));

        UserEntity provider = userRepository.findById(request.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + request.getProviderId()));

        validateTimes(request.getSessionDate(), request.getStartTime(), request.getEndTime(), request.getDuration());

        SessionBookingEntity entity = new SessionBookingEntity();
        entity.setClient(client);
        entity.setProvider(provider);
        entity.setSessionDate(request.getSessionDate());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());

        int durationMinutes = (int) ChronoUnit.MINUTES
                .between(request.getStartTime(), request.getEndTime());
        entity.setDuration(durationMinutes);

        entity.setIssueDescription(request.getIssueDescription());
        entity.setStatus(SessionStatus.PENDING);
        entity.setReminderSent(false);

        if (entity.getStatus() == null) {
            entity.setStatus(SessionStatus.PENDING);
        }
        System.out.println("Saving session booking with status: " + entity.getStatus());

        SessionBookingEntity saved = sessionBookingRepository.save(entity);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionBookingResponseDTO> getSessionsForProvider(Long providerId) {
        LocalDateTime now = LocalDateTime.now();
        List<SessionStatus> excluded = List.of(SessionStatus.COMPLETED, SessionStatus.NOT_COMPLETED);

        return sessionBookingRepository.findUpcomingSessionsForProvider(
                providerId,
                now.toLocalDate(),
                now.toLocalTime(),
                excluded).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionBookingResponseDTO> getSessionsForClient(Long clientId) {
        LocalDateTime now = LocalDateTime.now();
        List<SessionStatus> excluded = List.of(SessionStatus.COMPLETED, SessionStatus.NOT_COMPLETED);

        return sessionBookingRepository.findUpcomingSessionsForClient(
                clientId,
                now.toLocalDate(),
                now.toLocalTime(),
                excluded).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SessionBookingResponseDTO acceptSession(Long sessionId, String providerEmail, SessionStatusUpdateDTO body) {
        SessionBookingEntity session = loadAndValidateProviderOwnership(sessionId, providerEmail);
        session.setStatus(SessionStatus.CONFIRMED);
        if (body != null && body.getProviderMessage() != null) {
            session.setProviderMessage(body.getProviderMessage());
        }
        SessionBookingEntity saved = sessionBookingRepository.save(session);
        notificationService.notifySessionConfirmedForClient(saved);
        return toDto(saved);
    }

    @Transactional
    public SessionBookingResponseDTO rescheduleSession(Long sessionId, String providerEmail,
            SessionRescheduleRequestDTO body) {
        SessionBookingEntity session = loadAndValidateProviderOwnership(sessionId, providerEmail);

        LocalDate newDate = body.getNewSessionDate() != null ? body.getNewSessionDate() : session.getSessionDate();
        LocalTime newStart = body.getNewStartTime() != null ? body.getNewStartTime() : session.getStartTime();
        LocalTime newEnd = body.getNewEndTime() != null ? body.getNewEndTime() : session.getEndTime();

        validateTimes(newDate, newStart, newEnd, null);

        session.setSessionDate(newDate);
        session.setStartTime(newStart);
        session.setEndTime(newEnd);
        session.setDuration((int) ChronoUnit.MINUTES.between(newStart, newEnd));
        session.setStatus(SessionStatus.RESCHEDULE_REQUESTED);
        session.setProviderMessage(body.getProviderMessage());
        session.setReminderSent(false);

        SessionBookingEntity saved = sessionBookingRepository.save(session);
        notificationService.notifySessionRescheduleSuggested(saved);
        return toDto(saved);
    }

    @Transactional
    public SessionBookingResponseDTO rejectSession(Long sessionId, String providerEmail, SessionStatusUpdateDTO body) {
        SessionBookingEntity session = loadAndValidateProviderOwnership(sessionId, providerEmail);
        session.setStatus(SessionStatus.REJECTED);
        if (body != null && body.getProviderMessage() != null) {
            session.setProviderMessage(body.getProviderMessage());
        }
        session.setReminderSent(false);
        SessionBookingEntity saved = sessionBookingRepository.save(session);
        notificationService.notifySessionRejectedForClient(saved);
        return toDto(saved);
    }

    @Transactional
    public SessionBookingResponseDTO cancelSession(Long sessionId, String cancellerEmail) {
        SessionBookingEntity session = sessionBookingRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        UserEntity canceller = userRepository.findByEmail(cancellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + cancellerEmail));

        // Check if canceller is part of this session
        if (!isOwner(canceller, session)) {
            throw new ForbiddenActionException("You are not allowed to cancel this session");
        }

        session.setStatus(SessionStatus.CANCELLED);
        SessionBookingEntity saved = sessionBookingRepository.save(session);

        // Notify the other party
        try {
            notificationService.notifySessionCancelled(saved, canceller);
            emailService.sendSessionCancelledEmail(saved, canceller);
        } catch (Exception e) {
            log.error("Failed to send cancellation notification for session {}: {}", sessionId, e.getMessage());
        }

        return toDto(saved);
    }

    @Transactional
    public SessionBookingResponseDTO confirmReschedule(Long sessionId, String clientEmail) {
        SessionBookingEntity session = sessionBookingRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (!session.getClient().getEmail().equalsIgnoreCase(clientEmail)) {
            throw new ForbiddenActionException("You are not allowed to confirm this session");
        }

        if (session.getStatus() != SessionStatus.RESCHEDULE_REQUESTED) {
            throw new IllegalStateException("Session is not awaiting reschedule confirmation");
        }

        session.setStatus(SessionStatus.CONFIRMED);
        session.setReminderSent(false);

        SessionBookingEntity saved = sessionBookingRepository.save(session);
        notificationService.notifySessionConfirmedForClient(saved);
        scheduleSessionReminders(saved);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionBookingResponseDTO> findUpcomingRemindersForUser(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        List<SessionBookingEntity> candidates = sessionBookingRepository
                .findByStatusInAndReminderSentFalse(List.of(SessionStatus.CONFIRMED, SessionStatus.ACCEPTED));

        return candidates.stream()
                .filter(s -> isOwner(user, s))
                .filter(this::isWithinNext30MinutesWindow)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void processSessionReminders() {
        LocalDateTime now = LocalDateTime.now();

        List<SessionBookingEntity> candidates = sessionBookingRepository
                .findByStatusInAndReminderSentFalse(List.of(SessionStatus.CONFIRMED, SessionStatus.ACCEPTED));

        log.info("🔍 Checking {} sessions for reminders...", candidates.size());

        for (SessionBookingEntity session : candidates) {
            if (isWithinExact30MinuteWindow(session, now)) {
                try {
                    log.info("📩 Sending reminder for session ID: {} (Session starts at: {} {})", session.getId(),
                            session.getSessionDate(), session.getStartTime());
                    sendReminderEmails(session);
                    notificationService.notifySessionReminder(session);
                    session.setReminderSent(true);
                    sessionBookingRepository.save(session);
                    log.info("✅ Reminder sent and marked for session ID: {}", session.getId());
                } catch (Exception e) {
                    log.error("❌ Failed to send reminder for session {}: {}", session.getId(), e.getMessage());
                }
            }
        }
    }

    @Transactional
    public SessionBookingResponseDTO completeSession(Long sessionId, String providerEmail) {
        SessionBookingEntity session = loadAndValidateProviderOwnership(sessionId, providerEmail);

        if (session.getStatus() != SessionStatus.PENDING_COMPLETION_ACTION) {
            throw new IllegalStateException(
                    "Session can only be completed if it is in PENDING_COMPLETION_ACTION state. Current status: "
                            + session.getStatus());
        }

        session.setStatus(SessionStatus.COMPLETED);
        SessionBookingEntity saved = sessionBookingRepository.save(session);

        // Notify both parties
        notificationService.notifySessionCompleted(saved);

        // Send confirmation email to both parties
        try {
            emailService.sendSessionCompletedEmail(saved);
        } catch (Exception e) {
            log.error("Failed to send session completed emails for session {}: {}", sessionId, e.getMessage());
        }

        // Trigger calendar consistency
        updateDateConsistency(saved.getSessionDate(), saved.getProvider().getId());

        return toDto(saved);
    }

    @Transactional
    public SessionBookingResponseDTO markSessionNotCompleted(Long sessionId, String providerEmail) {
        SessionBookingEntity session = loadAndValidateProviderOwnership(sessionId, providerEmail);

        if (session.getStatus() != SessionStatus.PENDING_COMPLETION_ACTION) {
            throw new IllegalStateException(
                    "Session can only be marked as NOT_COMPLETED if it is in PENDING_COMPLETION_ACTION state. Current status: "
                            + session.getStatus());
        }

        session.setStatus(SessionStatus.NOT_COMPLETED);
        session.setRefunded(true);
        SessionBookingEntity saved = sessionBookingRepository.save(session);

        // Notify both parties (already sends to both in EmailService)
        notificationService.notifySessionNotCompleted(saved);
        try {
            emailService.sendSessionNotCompletedEmail(saved);
        } catch (Exception e) {
            log.error("Failed to send session not completed emails for session {}: {}", sessionId, e.getMessage());
        }

        // Trigger calendar consistency
        updateDateConsistency(saved.getSessionDate(), saved.getProvider().getId());

        return toDto(saved);
    }

    private void updateDateConsistency(LocalDate date, Long practitionerId) {
        List<SessionBookingEntity> sessions = sessionBookingRepository.findByProvider_IdAndSessionDate(practitionerId,
                date);
        if (sessions.isEmpty())
            return;

        boolean anyNotCompleted = sessions.stream().anyMatch(s -> s.getStatus() == SessionStatus.NOT_COMPLETED);
        boolean allCompleted = sessions.stream().allMatch(s -> s.getStatus() == SessionStatus.COMPLETED);

        String status = null;
        if (anyNotCompleted) {
            status = "YELLOW";
        } else if (allCompleted) {
            status = "GREEN";
        }

        List<com.wellness.backend.model.ProviderAvailabilityEntity> slots = providerAvailabilityRepository
                .findByProviderIdAndAvailableDate(practitionerId, date);
        for (com.wellness.backend.model.ProviderAvailabilityEntity slot : slots) {
            slot.setDateStatus(status);
            providerAvailabilityRepository.save(slot);
        }
    }

    private boolean isOwner(UserEntity user, SessionBookingEntity session) {
        Long uid = user.getId();
        return session.getClient().getId().equals(uid) || session.getProvider().getId().equals(uid);
    }

    private boolean isWithinNext30MinutesWindow(SessionBookingEntity session) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = LocalDateTime.of(session.getSessionDate(), session.getStartTime());
        LocalDateTime thirtyMinutesFromNow = now.plusMinutes(30);
        LocalDateTime thirtyFiveMinutesFromNow = now.plusMinutes(35);
        return (start.isAfter(thirtyMinutesFromNow.minusSeconds(1)) && start.isBefore(thirtyFiveMinutesFromNow));
    }

    private boolean isWithinExact30MinuteWindow(SessionBookingEntity session, LocalDateTime now) {
        LocalDateTime start = LocalDateTime.of(session.getSessionDate(), session.getStartTime());
        long minutesDiff = ChronoUnit.MINUTES.between(now, start);
        // Window: 29-31 minutes
        return minutesDiff >= 29 && minutesDiff <= 31;
    }

    private void sendReminderEmails(SessionBookingEntity session) {
        emailService.sendSessionReminderToClient(session);
        emailService.sendSessionReminderToProvider(session);
    }

    private void scheduleSessionReminders(SessionBookingEntity session) {
        LocalDateTime sessionStart = LocalDateTime.of(session.getSessionDate(), session.getStartTime());
        LocalDateTime reminderTime = sessionStart.minusMinutes(30);
        long epochSeconds = reminderTime.toEpochSecond(java.time.ZoneOffset.UTC);

        String clientSubject = "Session Reminder – Starts in 30 Minutes";
        String clientBody = String.format(
                "Dear %s,\n\nThis is a reminder that your session with Dr. %s starts in 30 minutes.",
                session.getClient().getName(), session.getProvider().getName());

        String providerSubject = "Upcoming Session in 30 Minutes";
        String providerBody = String.format("Dear %s,\n\nYou have an upcoming session with %s starting in 30 minutes.",
                session.getProvider().getName(), session.getClient().getName());

        emailService.sendScheduledReminder(session.getClient().getEmail(), clientSubject, clientBody, epochSeconds);
        emailService.sendScheduledReminder(session.getProvider().getEmail(), providerSubject, providerBody,
                epochSeconds);
    }

    private SessionBookingEntity loadAndValidateProviderOwnership(Long sessionId, String providerEmail) {
        SessionBookingEntity session = sessionBookingRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (!session.getProvider().getEmail().equalsIgnoreCase(providerEmail)) {
            throw new ForbiddenActionException("You are not allowed to modify this session");
        }

        return session;
    }

    private void validateTimes(LocalDate sessionDate, LocalTime start, LocalTime end, Integer duration) {
        if (end.isBefore(start) || end.equals(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (sessionDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Session date must not be in the past");
        }

        int computedDuration = (int) ChronoUnit.MINUTES.between(start, end);
        if (duration != null && !duration.equals(computedDuration)) {
            throw new IllegalArgumentException("Duration must match the difference between start and end time");
        }
    }

    private SessionBookingResponseDTO toDto(SessionBookingEntity entity) {
        String providerProfileImg = entity.getProvider().getProfileImage();
        if (providerProfileImg != null && !providerProfileImg.startsWith("http")) {
            providerProfileImg = "http://localhost:8080/uploads/" + providerProfileImg;
        }

        // Fetch date status from availability slots (if any)
        String dateStatus = null;
        List<com.wellness.backend.model.ProviderAvailabilityEntity> slots = providerAvailabilityRepository
                .findByProviderIdAndAvailableDate(entity.getProvider().getId(), entity.getSessionDate());
        if (!slots.isEmpty()) {
            dateStatus = slots.get(0).getDateStatus();
        }

        return SessionBookingResponseDTO.builder()
                .id(entity.getId())
                .clientId(entity.getClient().getId())
                .clientName(entity.getClient().getName())
                .clientEmail(entity.getClient().getEmail())
                .providerId(entity.getProvider().getId())
                .providerName(entity.getProvider().getName())
                .providerSpecialization(entity.getProvider().getSpecialization())
                .providerProfileImage(providerProfileImg)
                .sessionDate(entity.getSessionDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .duration(entity.getDuration())
                .issueDescription(entity.getIssueDescription())
                .status(entity.getStatus())
                .providerMessage(entity.getProviderMessage())
                .dateStatusColor(dateStatus)
                .reminderSent(entity.isReminderSent())
                .refunded(entity.isRefunded())
                .sessionFee(entity.getProvider().getSessionFee())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
