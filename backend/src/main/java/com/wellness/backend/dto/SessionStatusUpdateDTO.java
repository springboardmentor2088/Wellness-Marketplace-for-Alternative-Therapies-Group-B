package com.wellness.backend.dto;

import lombok.Data;

@Data
public class SessionStatusUpdateDTO {

    // Optional message for accept/reject flows
    private String providerMessage;
}

