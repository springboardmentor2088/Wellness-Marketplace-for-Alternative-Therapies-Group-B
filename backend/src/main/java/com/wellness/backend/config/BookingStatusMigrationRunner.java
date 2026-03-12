package com.wellness.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingStatusMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        // Ensure any legacy NULL statuses are set to PENDING
        jdbcTemplate.update("UPDATE session_bookings SET status = 'PENDING' WHERE status IS NULL");
        jdbcTemplate.update("UPDATE bookings SET status = 'PENDING' WHERE status IS NULL");
    }
}

