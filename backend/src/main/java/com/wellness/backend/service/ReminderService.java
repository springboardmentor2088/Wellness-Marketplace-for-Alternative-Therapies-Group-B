package com.wellness.backend.service;

import com.wellness.backend.model.BookingEntity;
import com.wellness.backend.model.SessionBookingEntity;
import com.wellness.backend.repository.BookingRepository;
import com.wellness.backend.repository.SessionBookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReminderService {

    private final EmailService emailService;
    private final BookingRepository bookingRepository;
    private final SessionBookingRepository sessionBookingRepository;

    private static final String ZONE_ID = "Asia/Kolkata";

    @Transactional
    public void scheduleBookingReminders(BookingEntity booking) {
        if (booking.getBookingDate() == null) {
            log.warn("⚠️ Skipping reminder for booking ID: {} — bookingDate is null.", booking.getId());
            return;
        }

        // ── Duplicate guard ──────────────────────────────────────────────────
        if (booking.isReminderScheduled()) {
            log.info("⏭ Reminder already scheduled for booking ID: {} — skipping duplicate SendGrid call.",
                    booking.getId());
            return;
        }

        LocalDateTime sessionStart = booking.getBookingDate();
        LocalDateTime reminderTime = sessionStart.minusMinutes(30);
        long epochSeconds = calculateEpoch(reminderTime);

        log.info("🕐 Scheduling booking reminder: ID={}, sessionStart={}, reminderTime={}, epoch={}",
                booking.getId(), sessionStart, reminderTime, epochSeconds);

        String clientSubject = "Notification: Session Reminder – Starts in 30 Minutes";
        String clientBody = String.format(
                "Dear %s,\n\nThis is a reminder that your session with %s starts in 30 minutes.",
                booking.getUser().getName(), booking.getPractitioner().getName());

        String practitionerSubject = "Notification: Upcoming Session in 30 Minutes";
        String practitionerBody = String.format(
                "Dear %s,\n\nThis is a reminder that you have a session with %s starting in 30 minutes.",
                booking.getPractitioner().getName(), booking.getUser().getName());

        // Schedule for patient
        String clientMsgId = emailService.sendScheduledReminder(
                booking.getUser().getEmail(), clientSubject, clientBody, epochSeconds);
        log.info("📧 Patient reminder queued for booking ID: {} — msgId={}",
                booking.getId(), clientMsgId != null ? clientMsgId : "FAILED");

        // Schedule for practitioner
        String messageId = emailService.sendScheduledReminder(
                booking.getPractitioner().getEmail(), practitionerSubject, practitionerBody, epochSeconds);
        log.info("📧 Practitioner reminder queued for booking ID: {} — msgId={}",
                booking.getId(), messageId != null ? messageId : "FAILED");

        if (messageId != null) {
            booking.setReminderScheduled(true);
            booking.setReminderScheduledAt(reminderTime);
            booking.setProviderMessageId(messageId);
            bookingRepository.save(booking);
            log.info("✅ Booking reminder persisted for booking ID: {} at epoch {}", booking.getId(), epochSeconds);
        } else {
            log.error("❌ SendGrid failed for booking ID: {} — reminderScheduled NOT set.", booking.getId());
        }
    }

    @Transactional
    public void scheduleSessionReminders(SessionBookingEntity session) {
        if (session.getSessionDate() == null || session.getStartTime() == null) {
            log.warn("⚠️ Skipping reminder for session ID: {} — date/time is null.", session.getId());
            return;
        }

        LocalDateTime sessionStart = LocalDateTime.of(session.getSessionDate(), session.getStartTime());
        LocalDateTime reminderTime = sessionStart.minusMinutes(30);
        long epochSeconds = calculateEpoch(reminderTime);

        log.info("🕐 Scheduling session reminder: ID={}, sessionStart={}, reminderTime={}, epoch={}",
                session.getId(), sessionStart, reminderTime, epochSeconds);

        String clientSubject = "Session Reminder – Starts in 30 Minutes";
        String clientBody = String.format(
                "Dear %s,\n\nThis is a reminder that your session with Dr. %s starts in 30 minutes.",
                session.getClient().getName(), session.getProvider().getName());

        String providerSubject = "Upcoming Session in 30 Minutes";
        String providerBody = String.format(
                "Dear %s,\n\nYou have an upcoming session with %s starting in 30 minutes.",
                session.getProvider().getName(), session.getClient().getName());

        String clientMsgId = emailService.sendScheduledReminder(
                session.getClient().getEmail(), clientSubject, clientBody, epochSeconds);
        log.info("📧 Patient reminder queued for session ID: {} — msgId={}",
                session.getId(), clientMsgId != null ? clientMsgId : "FAILED");

        String providerMsgId = emailService.sendScheduledReminder(
                session.getProvider().getEmail(), providerSubject, providerBody, epochSeconds);
        log.info("📧 Practitioner reminder queued for session ID: {} — msgId={}",
                session.getId(), providerMsgId != null ? providerMsgId : "FAILED");

        if (clientMsgId != null || providerMsgId != null) {
            session.setReminderSent(false); // Reset to allow poller to send in-app notifications if needed
            sessionBookingRepository.save(session);
            log.info("✅ Session reminder persisted for session ID: {} at epoch {}", session.getId(), epochSeconds);
        } else {
            log.error("❌ Both SendGrid calls failed for session ID: {} — no reminder was scheduled.", session.getId());
        }
    }

    @Transactional
    public void cancelBookingReminders(Long bookingId) {
        bookingRepository.findById(bookingId).ifPresent(booking -> {
            booking.setReminderScheduled(false);
            bookingRepository.save(booking);
            log.info("🚫 reminders cancelled/marked as inactive for booking ID: {}", bookingId);
        });
    }

    @Transactional
    public void cancelSessionReminders(Long sessionId) {
        sessionBookingRepository.findById(sessionId).ifPresent(session -> {
            session.setReminderSent(true); // Treat as "sent" or "inactive" for poller
            sessionBookingRepository.save(session);
            log.info("🚫 reminders cancelled/marked as inactive for session ID: {}", sessionId);
        });
    }

    private long calculateEpoch(LocalDateTime localTime) {
        // Converts to epoch seconds using Asia/Kolkata (IST) to match the application
        // timezone
        long epoch = ZonedDateTime.of(localTime, ZoneId.of(ZONE_ID)).toEpochSecond();
        log.debug("🕰 Epoch for {} ({}) = {}", localTime, ZONE_ID, epoch);
        return epoch;
    }
}
