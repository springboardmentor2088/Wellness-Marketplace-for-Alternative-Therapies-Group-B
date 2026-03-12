package com.wellness.backend.repository;

import com.wellness.backend.model.TherapySessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TherapySessionRepository extends JpaRepository<TherapySessionEntity, Long> {
    List<TherapySessionEntity> findByProviderId(Long providerId);
}
