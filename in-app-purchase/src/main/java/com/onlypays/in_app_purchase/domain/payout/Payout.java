package com.onlypays.in_app_purchase.domain.payout;

import com.onlypays.in_app_purchase.domain.idempotency.IdempotencyKey;
import com.onlypays.in_app_purchase.domain.wallet.Wallet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payouts", indexes = {
    @Index(name = "idx_payouts_stripe_transfer_id", columnList = "stripe_transfer_id", unique = true),
    @Index(name = "idx_payouts_wallet_id", columnList = "wallet_id"),
    @Index(name = "idx_payouts_status", columnList = "status"),
    @Index(name = "idx_payouts_idempotency", columnList = "idempotency_key_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idempotency_key_id", nullable = false)
    private IdempotencyKey idempotencyKey;

    @Column(name = "stripe_transfer_id", unique = true, length = 255)
    private String stripeTransferId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PayoutStatus status;

    @Column(name = "amount_opx", nullable = false)
    private Long amountOpx;

    @Column(name = "amount_usd_cents", nullable = false)
    private Long amountUsdCents;

    @Column(name = "exchange_rate", nullable = false, precision = 10, scale = 6)
    private BigDecimal exchangeRate;

    @Column(name = "stripe_connect_account_id", nullable = false, length = 255)
    private String stripeConnectAccountId;

    @Column(name = "failure_reason", columnDefinition = "text")
    private String failureReason;

    @Column(name = "processed_at")
    private Instant processedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
