package com.onlypays.in_app_purchase.domain.wallet;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "wallets", indexes = {
    @Index(name = "idx_wallets_user_id", columnList = "user_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "balance_opx", nullable = false)
    @Builder.Default
    private Long balanceOpx = 0L;

    @Column(name = "reserved_opx", nullable = false)
    @Builder.Default
    private Long reservedOpx = 0L;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public void credit(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }
        this.balanceOpx += amount;
    }

    public void debit(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }
        if (this.balanceOpx < amount) {
            throw new IllegalStateException("Insufficient spendable Opx balance");
        }
        this.balanceOpx -= amount;
    }

    public void hold(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Hold amount must be positive");
        }
        if (this.balanceOpx < amount) {
            throw new IllegalStateException("Insufficient spendable Opx balance for hold");
        }
        this.balanceOpx -= amount;
        this.reservedOpx += amount;
    }

    public void releaseHold(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Release amount must be positive");
        }
        if (this.reservedOpx < amount) {
            throw new IllegalStateException("Reserved balance is less than release amount");
        }
        this.reservedOpx -= amount;
        this.balanceOpx += amount;
    }

    public void captureHold(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Capture amount must be positive");
        }
        if (this.reservedOpx < amount) {
            throw new IllegalStateException("Reserved balance is less than capture amount");
        }
        this.reservedOpx -= amount;
    }
}
