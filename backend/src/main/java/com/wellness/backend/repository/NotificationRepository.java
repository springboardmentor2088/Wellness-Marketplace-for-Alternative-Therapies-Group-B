package com.wellness.backend.repository;

import com.wellness.backend.model.NotificationEntity;
import com.wellness.backend.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    List<NotificationEntity> findByRecipient_IdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipient_IdAndReadFalse(Long recipientId);

    boolean existsByRecipient_IdAndTypeAndRelatedBookingId(Long recipientId, NotificationType type,
            Long relatedBookingId);
}
