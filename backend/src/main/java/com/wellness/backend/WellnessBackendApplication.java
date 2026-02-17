package com.wellness.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

// Exclude SecurityAutoConfiguration so explicit security config isn't required
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class WellnessBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(WellnessBackendApplication.class, args);
    }

}
