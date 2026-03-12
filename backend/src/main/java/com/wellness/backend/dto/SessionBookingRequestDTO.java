package com.wellness.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SessionBookingRequestDTO {

    @NotNull
    private Long providerId;

    @NotNull
    @FutureOrPresent(message = "Session date must not be in the past")
    private LocalDate sessionDate;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotNull
    @Min(1)
    private Integer duration;

    @NotBlank
    private String issueDescription;
}

