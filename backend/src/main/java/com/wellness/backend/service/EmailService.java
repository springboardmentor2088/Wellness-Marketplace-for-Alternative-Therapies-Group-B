package com.wellness.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.retry.annotation.Recover;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

        @Autowired
        private JavaMailSender mailSender;

        @Value("${spring.mail.from}")
        private String fromEmail;

        public void sendVerificationEmail(String to, String token) {
                String verificationUrl = "http://localhost:5173/verify?token=" + token;

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("Wellness Hub - Email Verification");
                message.setText("Welcome to Wellness Hub!\n\n" +
                                "Please verify your email by clicking the link below:\n" +
                                verificationUrl + "\n\n" +
                                "If you did not create an account, please ignore this email.");

                sendEmail(message);
        }

        public void sendOtpEmail(String to, String otp) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("Wellness Hub - Your OTP Verification Code");
                message.setText("Welcome to Wellness Hub!\n\n" +
                                "Your OTP code for registration is: " + otp + "\n\n" +
                                "This code will expire in 10 minutes.\n" +
                                "If you did not request this, please ignore this email.");
                sendEmail(message);
        }

        public void sendApprovalEmail(String to) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("Wellness Hub - Account Approved");
                message.setText("Congratulations!\n\n" +
                                "Your Wellness Hub account has been approved by the admin. You can now access all professional features.\n\n"
                                +
                                "Login here: http://localhost:5173/login");
                sendEmail(message);
        }

        public void sendRejectionEmail(String to) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("Wellness Hub - Account Application Update");
                message.setText("Hello,\n\n" +
                                "We regret to inform you that your application for a Wellness Hub professional account has been rejected at this time.\n"
                                +
                                "If you believe this is an error, please contact support.");
                sendEmail(message);
        }

        public void sendForgotPasswordEmail(String to, String newPassword) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("Wellness Hub - Password Reset");
                message.setText("Hello,\n\n" +
                                "Your password has been reset as requested.\n" +
                                "Temporary Password: " + newPassword + "\n\n" +
                                "Please login and change your password as soon as possible for security reasons.\n" +
                                "Login here: http://localhost:5173/login");
                sendEmail(message);
        }

        public void sendBookingConfirmedToClient(com.wellness.backend.model.BookingEntity booking) {
                String to = booking.getUser().getEmail();
                String practitionerName = booking.getPractitioner().getName();
                String dateTime = booking.getBookingDate() != null
                                ? booking.getBookingDate().toString().replace("T", " at ")
                                : "N/A";
                String fee = booking.getSessionFee() != null ? "₹" + booking.getSessionFee().toPlainString() : "N/A";

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("✅ Wellness Hub – Session Confirmed!");
                message.setText("Dear " + booking.getUser().getName() + ",\n\n"
                                + "Great news! Your session has been confirmed.\n\n"
                                + "Practitioner: " + practitionerName + "\n"
                                + "Date & Time: " + dateTime + "\n"
                                + "Session Fee: " + fee + "\n"
                                + (booking.getNotes() != null && !booking.getNotes().isBlank()
                                                ? "Your Notes: " + booking.getNotes() + "\n"
                                                : "")
                                + "\nPlease be available at the scheduled time.\n"
                                + "You can view your session details at: http://localhost:5173/user\n\n"
                                + "Best regards,\nWellness Hub");
                sendEmail(message);
        }

        public void sendBookingRejectedToClient(com.wellness.backend.model.BookingEntity booking) {
                String to = booking.getUser().getEmail();
                String practitionerName = booking.getPractitioner().getName();

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("❌ Wellness Hub – Session Request Update");
                message.setText("Dear " + booking.getUser().getName() + ",\n\n"
                                + "Unfortunately, your session request with " + practitionerName
                                + " could not be accepted at this time.\n\n"
                                + (booking.getPractitionerComment() != null
                                                && !booking.getPractitionerComment().isBlank()
                                                                ? "Practitioner's Note: "
                                                                                + booking.getPractitionerComment()
                                                                                + "\n\n"
                                                                : "")
                                + "You can book another session with a different time or practitioner at: http://localhost:5173/marketplace\n\n"
                                + "Best regards,\nWellness Hub");
                sendEmail(message);
        }

        public void sendRescheduleSuggestedToClient(com.wellness.backend.model.BookingEntity booking) {
                String to = booking.getUser().getEmail();
                String practitionerName = booking.getPractitioner().getName();
                String newDateTime = booking.getBookingDate() != null
                                ? booking.getBookingDate().toString().replace("T", " at ")
                                : "N/A";

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("🔄 Wellness Hub – New Session Time Suggested");
                message.setText("Dear " + booking.getUser().getName() + ",\n\n"
                                + practitionerName + " has suggested a new time for your session.\n\n"
                                + "New Date & Time: " + newDateTime + "\n"
                                + (booking.getPractitionerComment() != null
                                                && !booking.getPractitionerComment().isBlank()
                                                                ? "Message: " + booking.getPractitionerComment()
                                                                                + "\n\n"
                                                                : "\n")
                                + "Please log in to accept or decline this new time:\n"
                                + "http://localhost:5173/user\n\n"
                                + "Best regards,\nWellness Hub");
                sendEmail(message);
        }

        public void sendBookingReceivedToClient(com.wellness.backend.model.BookingEntity booking) {
                String to = booking.getUser().getEmail();
                String practitionerName = booking.getPractitioner().getName();
                String dateTime = booking.getBookingDate() != null
                                ? booking.getBookingDate().toString().replace("T", " at ")
                                : "N/A";
                String fee = booking.getSessionFee() != null ? "₹" + booking.getSessionFee().toPlainString() : "N/A";

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("📅 Wellness Hub – Booking Request Received");
                message.setText("Dear " + booking.getUser().getName() + ",\n\n"
                                + "Your session booking request has been submitted successfully!\n\n"
                                + "Practitioner: " + practitionerName + "\n"
                                + "Date & Time: " + dateTime + "\n"
                                + "Session Fee: " + fee + "\n\n"
                                + "You will receive an email once the practitioner accepts or suggests a new time.\n"
                                + "Track your booking at: http://localhost:5173/user\n\n"
                                + "Best regards,\nWellness Hub");
                sendEmail(message);
        }

        public void sendSessionReminderToClient(com.wellness.backend.model.SessionBookingEntity session) {
                String to = session.getClient().getEmail();
                String doctorName = session.getProvider().getName();
                String date = session.getSessionDate().toString();
                String time = session.getStartTime() + " - " + session.getEndTime();
                String duration = session.getDuration() + " minutes";

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("Session Reminder – Starts in 30 Minutes");
                message.setText("Dear " + session.getClient().getName() + ",\n\n"
                                + "This is a reminder that your session with " + doctorName
                                + " starts in 30 minutes.\n\n"
                                + "Date: " + date + "\n"
                                + "Time: " + time + "\n"
                                + "Duration: " + duration + "\n"
                                + "Issue Summary: " + session.getIssueDescription() + "\n\n"
                                + "You can manage your sessions by logging into the Wellness Hub portal.\n\n"
                                + "Best regards,\n"
                                + "Wellness Hub");
                sendEmail(message);
        }

        public void sendSessionReminderToClient(com.wellness.backend.model.BookingEntity booking) {
                String to = booking.getUser().getEmail();
                String practitionerName = booking.getPractitioner().getName();
                String dateTime = booking.getBookingDate().toString().replace("T", " at ");
                String duration = booking.getDuration() + " minutes";

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("🔔 Wellness Hub – Session Reminder");
                message.setText("Dear " + booking.getUser().getName() + ",\n\n"
                                + "This is a reminder that your session with " + practitionerName
                                + " starts in 30 minutes.\n\n"
                                + "Date & Time: " + dateTime + "\n"
                                + "Duration: " + duration + "\n"
                                + (booking.getNotes() != null ? "Your Notes: " + booking.getNotes() + "\n\n" : "")
                                + "You can join or manage your session here: http://localhost:5173/user\n\n"
                                + "Best regards,\nWellness Hub");
                sendEmail(message);
        }

        public void sendSessionReminderToProvider(com.wellness.backend.model.SessionBookingEntity session) {
                String to = session.getProvider().getEmail();
                String patientName = session.getClient().getName();
                String date = session.getSessionDate().toString();
                String time = session.getStartTime() + " - " + session.getEndTime();
                String duration = session.getDuration() + " minutes";

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("Upcoming Session in 30 Minutes");
                message.setText("Dear " + session.getProvider().getName() + ",\n\n"
                                + "You have an upcoming session starting in 30 minutes.\n\n"
                                + "Patient: " + patientName + "\n"
                                + "Date: " + date + "\n"
                                + "Time: " + time + "\n"
                                + "Duration: " + duration + "\n"
                                + "Issue Summary: " + session.getIssueDescription() + "\n\n"
                                + "Please log into your Wellness Hub practitioner portal to review details.\n\n"
                                + "Best regards,\n"
                                + "Wellness Hub");
                sendEmail(message);
        }

        public void sendSessionReminderToProvider(com.wellness.backend.model.BookingEntity booking) {
                String to = booking.getPractitioner().getEmail();
                String patientName = booking.getUser().getName();
                String dateTime = booking.getBookingDate().toString().replace("T", " at ");
                String duration = booking.getDuration() + " minutes";

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("🔔 Wellness Hub – Upcoming Session Reminder");
                message.setText("Dear " + booking.getPractitioner().getName() + ",\n\n"
                                + "This is a reminder that you have a session with " + patientName
                                + " starting in 30 minutes.\n\n"
                                + "Date & Time: " + dateTime + "\n"
                                + "Duration: " + duration + "\n"
                                + (booking.getNotes() != null ? "Patient's Notes: " + booking.getNotes() + "\n\n" : "")
                                + "Please log into the practitioner portal for more details: http://localhost:5173/practitioner\n\n"
                                + "Best regards,\nWellness Hub");
                sendEmail(message);
        }

        private void sendEmail(SimpleMailMessage message) {
                String recipient = (message.getTo() != null && message.getTo().length > 0) ? message.getTo()[0]
                                : "unknown";
                try {
                        log.info("📧 Attempting to send email to {}...", recipient);
                        mailSender.send(message);
                        log.info("✅ Email sent successfully to {}", recipient);
                } catch (org.springframework.mail.MailException e) {
                        log.error("❌ SMTP Error while sending to {}: {}", recipient, e.getMessage());
                        throw e; // Rethrow for @Retryable if applicable, or for the controller catch
                }
        }

        @Recover
        public void recover(Exception e, SimpleMailMessage message) {
                String recipient = (message.getTo() != null && message.getTo().length > 0) ? message.getTo()[0]
                                : "unknown";
                log.error("❌ FINAL FAILURE: Could not send email to {} after retries. Error: {}", recipient,
                                e.getMessage());
        }
}
