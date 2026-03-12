package com.wellness.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.Collections;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, String>> handleValidationExceptions(
                        org.springframework.web.bind.MethodArgumentNotValidException ex) {
                String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                                .map(error -> error.getDefaultMessage())
                                .findFirst()
                                .orElse("Validation failed");
                return ResponseEntity.badRequest()
                                .body(Collections.singletonMap("error", errorMessage));
        }

        @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
        public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(
                        org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                                .body(Collections.singletonMap("error",
                                                "Database error: " + e.getMostSpecificCause().getMessage()));
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleResourceNotFoundException(ResourceNotFoundException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                                .body(Collections.singletonMap("error", e.getMessage()));
        }

        @ExceptionHandler(ForbiddenActionException.class)
        public ResponseEntity<Map<String, String>> handleForbiddenActionException(ForbiddenActionException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                                .body(Collections.singletonMap("error", e.getMessage()));
        }

        @ExceptionHandler(BookingConflictException.class)
        public ResponseEntity<Map<String, String>> handleBookingConflictException(BookingConflictException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                                .body(Collections.singletonMap("error", e.getMessage()));
        }

        @ExceptionHandler({ IllegalArgumentException.class, RuntimeException.class })
        public ResponseEntity<Map<String, String>> handleBadRequestExceptions(RuntimeException e) {
                return ResponseEntity.badRequest()
                                .body(Collections.singletonMap("error", e.getMessage()));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, String>> handleException(Exception e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Collections.singletonMap("error",
                                                e.getMessage() != null ? e.getMessage()
                                                                : "An unexpected error occurred"));
        }
}
