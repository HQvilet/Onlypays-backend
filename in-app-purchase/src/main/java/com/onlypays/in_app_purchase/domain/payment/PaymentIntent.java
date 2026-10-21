package com.onlypays.in_app_purchase.domain.payment;

import com.onlypays.in_app_purchase.domain.idempotency.IdempotencyKey;
import com.onlypays.in_app_purchase.domain.wallet.Wallet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_intents", indexes = {
    @Index(name = "idx_payment_intents_stripe_id", columnList = "stripe_payment_intent_id", unique = true),
    @Index(name = "idx_payment_intents_wallet_id", columnList = "wallet_id"),
    @Index(name = "idx_payment_intents_status", columnList = "status"),
    @Index(name = "idx_payment_intents_idempotency", columnList = "idempotency_key_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idempotency_key_id", nullable = false)
    private IdempotencyKey idempotencyKey;

    @Column(name = "stripe_payment_intent_id", unique = true, length = 255)
    private String stripePaymentIntentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PaymentIntentStatus status;

    @Column(name = "amount_opx", nullable = false)
    private Long amountOpx;

    @Column(name = "amount_usd_cents", nullable = false)
    private Long amountUsdCents;

    @Column(name = "exchange_rate", nullable = false, precision = 10, scale = 6)
    private BigDecimal exchangeRate;

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "USD";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "stripe_metadata", columnDefinition = "jsonb")
    @Builder.Default
    private String stripeMetadata = "{}";

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
