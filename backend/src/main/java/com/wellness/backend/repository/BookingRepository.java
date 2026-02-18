package com.wellness.backend.repository;

import com.wellness.backend.model.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    List<BookingEntity> findByUserId(Long userId);

    List<BookingEntity> findByPractitionerId(Long practitionerId);
}
