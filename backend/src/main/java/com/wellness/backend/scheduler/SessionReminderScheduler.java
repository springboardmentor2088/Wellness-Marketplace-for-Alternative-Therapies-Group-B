package com.wellness.backend.scheduler;

import com.wellness.backend.service.SessionBookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionReminderScheduler {

    private final SessionBookingService sessionBookingService;
    private final com.wellness.backend.service.BookingService bookingService;

    // Runs every 1 minute
    @Scheduled(fixedRate = 60_000)
    public void runSessionReminders() {
        log.info("⏰ Session Reminder Scheduler started...");
        try {
            sessionBookingService.processSessionReminders();
            bookingService.processSessionReminders();

            // Auto-complete sessions that have passed
            sessionBookingService.autoProcessSessionCompletion();
            bookingService.autoProcessSessionCompletion();
        } catch (Exception e) {
            log.error("❌ Error during session reminder/completion processing", e);
        }
        log.info("✅ Session Reminder Scheduler finished.");
    }
}
