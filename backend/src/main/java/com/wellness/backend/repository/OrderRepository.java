package com.wellness.backend.repository;

import com.wellness.backend.model.OrderEntity;
import com.wellness.backend.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUser(UserEntity user);

    @Query("SELECT o FROM OrderEntity o WHERE o.product.provider.id = :providerId")
    List<OrderEntity> findByProductProviderId(Long providerId);

    // Keeping these for internal use if needed, or I can remove them if they
    // conflict
    List<OrderEntity> findByUser_Id(Long userId);

    @Query("SELECT SUM(o.totalPrice) FROM OrderEntity o WHERE o.product.provider.id = :providerId AND o.status <> 'CANCELLED' AND o.orderDate >= :start AND o.orderDate < :end")
    java.math.BigDecimal sumProductRevenueByProviderAndDateRange(Long providerId, java.time.LocalDateTime start,
            java.time.LocalDateTime end);

    @Query("SELECT SUM(o.totalPrice) FROM OrderEntity o WHERE o.product.provider.id = :providerId AND o.status <> 'CANCELLED'")
    java.math.BigDecimal sumTotalProductRevenueByProvider(Long providerId);

    @Query("SELECT SUM(o.totalPrice) FROM OrderEntity o WHERE o.user.id = :userId AND o.status <> 'CANCELLED'")
    java.math.BigDecimal sumTotalProductSpentByPatient(Long userId);

    @Query("SELECT SUM(o.totalPrice) FROM OrderEntity o WHERE o.user.id = :userId AND o.status <> 'CANCELLED' AND o.orderDate >= :start AND o.orderDate < :end")
    java.math.BigDecimal sumProductSpentByPatientAndDateRange(Long userId, java.time.LocalDateTime start,
            java.time.LocalDateTime end);

    List<OrderEntity> findTop5ByUser_IdOrderByOrderDateDesc(Long userId);
}
