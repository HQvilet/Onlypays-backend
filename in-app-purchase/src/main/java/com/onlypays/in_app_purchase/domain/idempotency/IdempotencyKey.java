package com.onlypays.in_app_purchase.domain.idempotency;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "idempotency_keys", indexes = {
    @Index(name = "idx_idempotency_keys_key", columnList = "key", unique = true),
    @Index(name = "idx_idempotency_keys_user_op", columnList = "user_id, operation"),
    @Index(name = "idx_idempotency_keys_expires_at", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdempotencyKey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "key", nullable = false, unique = true, length = 255)
    private String key;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "operation", nullable = false, length = 100)
    private String operation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "request_hash", nullable = false, columnDefinition = "jsonb")
    private String requestHash;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "response_snapshot", columnDefinition = "jsonb")
    private String responseSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private IdempotencyStatus status;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
