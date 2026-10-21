package com.onlypays.in_app_purchase.domain.idempotency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, UUID> {

    Optional<IdempotencyKey> findByKey(String key);

    Optional<IdempotencyKey> findByKeyAndUserId(String key, UUID userId);

    void deleteAllByExpiresAtBefore(Instant timestamp);
}
