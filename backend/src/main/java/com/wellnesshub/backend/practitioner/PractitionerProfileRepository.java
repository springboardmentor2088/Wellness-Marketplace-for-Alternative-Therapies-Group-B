package com.wellnesshub.backend.practitioner;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PractitionerProfileRepository 
        extends JpaRepository<PractitionerProfileEntity, Long> {

    Optional<PractitionerProfileEntity> findByUserId(Long userId);
}
