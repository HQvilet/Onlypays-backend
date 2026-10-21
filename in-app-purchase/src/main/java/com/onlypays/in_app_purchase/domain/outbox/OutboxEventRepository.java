package com.onlypays.in_app_purchase.domain.outbox;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    @Query("SELECT o FROM OutboxEvent o WHERE o.status = :status AND o.scheduledAt <= :now ORDER BY o.createdAt ASC")
    List<OutboxEvent> findPendingEvents(@Param("status") OutboxStatus status, @Param("now") Instant now, Pageable pageable);

    List<OutboxEvent> findByAggregateId(UUID aggregateId);

    List<OutboxEvent> findByCorrelationId(UUID correlationId);
}
