package com.wellness.backend.repository;

import com.wellness.backend.model.BookingEntity;
import com.wellness.backend.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

    @Query("SELECT b FROM BookingEntity b JOIN FETCH b.user JOIN FETCH b.practitioner WHERE b.user.id = :userId ORDER BY b.bookingDate DESC")
    List<BookingEntity> findByUser_Id(Long userId);

    @Query("SELECT b FROM BookingEntity b JOIN FETCH b.user JOIN FETCH b.practitioner WHERE b.user.id = :userId AND b.status IN :statuses ORDER BY b.bookingDate DESC")
    List<BookingEntity> findByUser_IdAndStatusIn(Long userId, List<BookingStatus> statuses);

    @Query("SELECT b FROM BookingEntity b JOIN FETCH b.user JOIN FETCH b.practitioner WHERE b.practitioner.id = :practitionerId ORDER BY b.bookingDate DESC")
    List<BookingEntity> findByPractitioner_Id(Long practitionerId);

    @Query("SELECT b FROM BookingEntity b JOIN FETCH b.user JOIN FETCH b.practitioner WHERE b.practitioner.id = :practitionerId AND b.status = :status ORDER BY b.bookingDate DESC")
    List<BookingEntity> findByPractitioner_IdAndStatus(Long practitionerId, BookingStatus status);

    boolean existsByPractitioner_IdAndBookingDate(Long practitionerId, LocalDateTime bookingDate);

    @Query("SELECT SUM(b.sessionFee) FROM BookingEntity b WHERE b.practitioner.id = :practitionerId AND b.status IN (com.wellness.backend.model.BookingStatus.ACCEPTED, com.wellness.backend.model.BookingStatus.CONFIRMED, com.wellness.backend.model.BookingStatus.COMPLETED) AND b.bookingDate >= :start AND b.bookingDate < :end")
    java.math.BigDecimal sumSessionRevenueByPractitionerAndDateRange(Long practitionerId, LocalDateTime start,
            LocalDateTime end);

    @Query("SELECT SUM(b.sessionFee) FROM BookingEntity b WHERE b.practitioner.id = :practitionerId AND b.status IN (com.wellness.backend.model.BookingStatus.ACCEPTED, com.wellness.backend.model.BookingStatus.CONFIRMED, com.wellness.backend.model.BookingStatus.COMPLETED)")
    java.math.BigDecimal sumTotalSessionRevenueByPractitioner(Long practitionerId);

    @Query("SELECT SUM(b.sessionFee) FROM BookingEntity b WHERE b.user.id = :userId AND b.status IN (com.wellness.backend.model.BookingStatus.ACCEPTED, com.wellness.backend.model.BookingStatus.CONFIRMED, com.wellness.backend.model.BookingStatus.COMPLETED)")
    java.math.BigDecimal sumTotalSessionSpentByPatient(Long userId);

    @Query("SELECT SUM(b.sessionFee) FROM BookingEntity b WHERE b.user.id = :userId AND b.status IN (com.wellness.backend.model.BookingStatus.ACCEPTED, com.wellness.backend.model.BookingStatus.CONFIRMED, com.wellness.backend.model.BookingStatus.COMPLETED) AND b.bookingDate >= :start AND b.bookingDate < :end")
    java.math.BigDecimal sumSessionSpentByPatientAndDateRange(Long userId, LocalDateTime start, LocalDateTime end);

    long countByUser_IdAndStatusIn(Long userId, List<com.wellness.backend.model.BookingStatus> statuses);

    List<BookingEntity> findByStatusAndReminderSentFalse(BookingStatus status);

    List<BookingEntity> findTop5ByUser_IdOrderByBookingDateDesc(Long userId);
}
