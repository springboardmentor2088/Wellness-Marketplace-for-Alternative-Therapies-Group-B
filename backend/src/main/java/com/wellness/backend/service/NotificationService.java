package com.wellness.backend.service;

import com.wellness.backend.dto.NotificationDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.BookingEntity;
import com.wellness.backend.model.NotificationEntity;
import com.wellness.backend.model.NotificationType;
import com.wellness.backend.model.SessionBookingEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.NotificationRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long id, String email) {
        NotificationEntity notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));

        if (!notification.getRecipient().getEmail().equalsIgnoreCase(email)) {
            throw new IllegalStateException("You are not allowed to modify this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyBookingRequest(BookingEntity booking) {
        UserEntity practitioner = booking.getPractitioner();
        String clientName = booking.getUser().getName();

        String message = "New booking request from " + clientName;

        createNotification(practitioner, NotificationType.BOOKING_REQUEST, message, booking.getId());
    }

    @Transactional
    public void notifyBookingAcceptedForClient(BookingEntity booking) {
        UserEntity client = booking.getUser();
        String practitionerName = booking.getPractitioner().getName();
        String dateTime = booking.getBookingDate() != null
                ? booking.getBookingDate().toLocalDate() + " at "
                        + booking.getBookingDate().toLocalTime().toString().substring(0, 5)
                : "scheduled time";
        String message = String.format("✅ %s confirmed your session on %s", practitionerName, dateTime);
        createNotification(client, NotificationType.SESSION_CONFIRMED, message, booking.getId());
    }

    @Transactional
    public void notifyBookingRejectedForClient(BookingEntity booking) {
        UserEntity client = booking.getUser();
        String practitionerName = booking.getPractitioner().getName();
        String message = String.format("❌ %s declined your session request", practitionerName);
        createNotification(client, NotificationType.SESSION_REJECTED, message, booking.getId());
    }

    @Transactional
    public void notifyBookingRescheduledForClient(BookingEntity booking) {
        UserEntity client = booking.getUser();
        String practitionerName = booking.getPractitioner().getName();
        String newTime = booking.getBookingDate() != null
                ? booking.getBookingDate().toLocalDate() + " at "
                        + booking.getBookingDate().toLocalTime().toString().substring(0, 5)
                : "a new time";
        String message = String.format("🔄 %s suggested a new time: %s. Please log in to accept or decline.",
                practitionerName, newTime);
        createNotification(client, NotificationType.SESSION_RESCHEDULE_SUGGESTED, message, booking.getId());
    }

    @Transactional
    public void notifySessionConfirmedForClient(SessionBookingEntity session) {
        UserEntity client = session.getClient();
        String providerName = session.getProvider().getName();

        String message = String.format(
                "Dr. %s has confirmed your session on %s at %s",
                providerName,
                session.getSessionDate(),
                session.getStartTime());

        createNotification(client, NotificationType.SESSION_CONFIRMED, message, session.getId());
    }

    @Transactional
    public void notifySessionRejectedForClient(SessionBookingEntity session) {
        UserEntity client = session.getClient();

        String message = "Your session request was rejected.";

        createNotification(client, NotificationType.SESSION_REJECTED, message, session.getId());
    }

    @Transactional
    public void notifySessionRescheduleSuggested(SessionBookingEntity session) {
        UserEntity client = session.getClient();
        String providerName = session.getProvider().getName();

        String message = String.format(
                "Dr. %s suggested a new time on %s at %s",
                providerName,
                session.getSessionDate(),
                session.getStartTime());

        createNotification(client, NotificationType.SESSION_RESCHEDULE_SUGGESTED, message, session.getId());
    }

    @Transactional
    public void notifySessionReminder(SessionBookingEntity session) {
        UserEntity client = session.getClient();
        UserEntity provider = session.getProvider();

        String clientMessage = String.format(
                "Reminder: your session with Dr. %s starts at %s",
                provider.getName(),
                session.getStartTime());
        String providerMessage = String.format(
                "Reminder: your session with %s starts at %s",
                client.getName(),
                session.getStartTime());

        createNotification(client, NotificationType.SESSION_REMINDER, clientMessage, session.getId());
        createNotification(provider, NotificationType.SESSION_REMINDER, providerMessage, session.getId());
    }

    @Transactional
    public void notifyBookingReminder(BookingEntity booking) {
        UserEntity client = booking.getUser();
        UserEntity practitioner = booking.getPractitioner();

        String clientMessage = String.format(
                "Reminder: your session with Dr. %s starts at %s",
                practitioner.getName(),
                booking.getBookingDate().toLocalTime().toString());
        String practitionerMessage = String.format(
                "Reminder: your session with %s starts at %s",
                client.getName(),
                booking.getBookingDate().toLocalTime().toString());

        createNotification(client, NotificationType.SESSION_REMINDER, clientMessage, booking.getId());
        createNotification(practitioner, NotificationType.SESSION_REMINDER, practitionerMessage, booking.getId());
    }

    @Transactional
    public void notifyBookingCancelled(BookingEntity booking, UserEntity canceller) {
        boolean cancelledByPractitioner = canceller.getId().equals(booking.getPractitioner().getId());
        UserEntity recipient = cancelledByPractitioner ? booking.getUser() : booking.getPractitioner();
        String cancellerName = canceller.getName();
        String dateTime = booking.getBookingDate() != null
                ? booking.getBookingDate().toLocalDate() + " at "
                        + booking.getBookingDate().toLocalTime().toString().substring(0, 5)
                : "scheduled time";

        String message = String.format("🚫 %s has cancelled the session scheduled for %s", cancellerName, dateTime);
        createNotification(recipient, NotificationType.SESSION_CANCELLED, message, booking.getId());
    }

    @Transactional
    public void notifySessionCancelled(SessionBookingEntity session, UserEntity canceller) {
        boolean cancelledByProvider = canceller.getId().equals(session.getProvider().getId());
        UserEntity recipient = cancelledByProvider ? session.getClient() : session.getProvider();
        String cancellerName = canceller.getName();

        String message = String.format("🚫 %s has cancelled the session scheduled for %s at %s",
                cancellerName, session.getSessionDate(), session.getStartTime());
        createNotification(recipient, NotificationType.SESSION_CANCELLED, message, session.getId());
    }

    @Transactional
    public void notifySessionNotCompleted(SessionBookingEntity session) {
        UserEntity client = session.getClient();
        UserEntity provider = session.getProvider();

        String message = String.format(
                "⚠️ Session on %s at %s was marked as not completed. A refund has been initiated.",
                session.getSessionDate(), session.getStartTime());

        createNotification(client, NotificationType.SESSION_NOT_COMPLETED, message, session.getId());
        createNotification(provider, NotificationType.SESSION_NOT_COMPLETED, message, session.getId());
    }

    @Transactional
    public void notifySessionCompleted(SessionBookingEntity session) {
        UserEntity client = session.getClient();
        UserEntity provider = session.getProvider();

        String message = String.format(
                "✅ Your session on %s at %s has been marked as COMPLETED. We hope it was productive!",
                session.getSessionDate(), session.getStartTime());

        createNotification(client, NotificationType.SESSION_COMPLETED, message, session.getId());
        createNotification(provider, NotificationType.SESSION_COMPLETED, message, session.getId());
    }

    private void createNotification(UserEntity recipient, NotificationType type, String message, Long relatedId) {
        // Prevent duplicate notifications for the same event and recipient
        if (notificationRepository.existsByRecipient_IdAndTypeAndRelatedBookingId(recipient.getId(), type, relatedId)) {
            return;
        }

        NotificationEntity entity = new NotificationEntity();
        entity.setRecipient(recipient);
        entity.setType(type);
        entity.setMessage(message);
        entity.setRelatedBookingId(relatedId);
        entity.setRead(false);
        notificationRepository.save(entity);
    }

    private NotificationDTO toDto(NotificationEntity entity) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(entity.getId());
        dto.setType(entity.getType());
        dto.setMessage(entity.getMessage());
        dto.setRead(entity.isRead());
        dto.setRelatedBookingId(entity.getRelatedBookingId());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
