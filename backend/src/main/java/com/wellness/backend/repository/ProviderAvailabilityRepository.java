package com.wellness.backend.repository;

import com.wellness.backend.model.ProviderAvailabilityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProviderAvailabilityRepository extends JpaRepository<ProviderAvailabilityEntity, Long> {
    List<ProviderAvailabilityEntity> findByProviderId(Long providerId);

    List<ProviderAvailabilityEntity> findByProviderIdAndAvailableDate(Long providerId, LocalDate availableDate);
}
