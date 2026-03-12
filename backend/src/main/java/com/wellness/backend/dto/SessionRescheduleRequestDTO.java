package com.wellness.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SessionRescheduleRequestDTO {

    @FutureOrPresent(message = "Session date must not be in the past")
    private LocalDate newSessionDate;

    private LocalTime newStartTime;

    private LocalTime newEndTime;

    @NotBlank(message = "Provider message is required when requesting reschedule")
    private String providerMessage;
}

