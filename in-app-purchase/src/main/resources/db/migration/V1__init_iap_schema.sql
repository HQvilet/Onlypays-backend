-- OnlyPays InAppPurchase Service Schema
-- Migration V1: Initial schema for wallets, transactions, payment_intents, payouts, idempotency_keys, outbox_events

-- Ensure target schema exists
CREATE SCHEMA IF NOT EXISTS in_app_purchase;

-- ==========================================
-- 1. Table: idempotency_keys
-- Deduplication table for all financial operations (24h TTL)
-- ==========================================
CREATE TABLE idempotency_keys (
    id                  UUID PRIMARY KEY,
    key                 VARCHAR(255) NOT NULL UNIQUE,
    user_id             UUID NOT NULL,
    operation           VARCHAR(100) NOT NULL,
    request_hash        JSONB NOT NULL,
    response_snapshot   JSONB NULL,
    status              VARCHAR(30) NOT NULL,
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_idempotency_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED'))
);

CREATE INDEX idx_idempotency_keys_key ON idempotency_keys (key);
CREATE INDEX idx_idempotency_keys_user_op ON idempotency_keys (user_id, operation);
CREATE INDEX idx_idempotency_keys_expires_at ON idempotency_keys (expires_at);

-- ==========================================
-- 2. Table: outbox_events
-- Transactional Outbox Pattern for guaranteed Kafka delivery
-- ==========================================
CREATE TABLE outbox_events (
    id                  UUID PRIMARY KEY,
    event_type          VARCHAR(100) NOT NULL,
    aggregate_type      VARCHAR(50) NOT NULL,
    aggregate_id        UUID NOT NULL,
    correlation_id      UUID NULL,
    causation_id        UUID NULL,
    payload             JSONB NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    retry_count         INT NOT NULL DEFAULT 0,
    scheduled_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at        TIMESTAMPTZ NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_outbox_status CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED'))
);

CREATE INDEX idx_outbox_events_status_scheduled ON outbox_events (status, scheduled_at);
CREATE INDEX idx_outbox_events_aggregate_id ON outbox_events (aggregate_id);
CREATE INDEX idx_outbox_events_correlation_id ON outbox_events (correlation_id);

-- ==========================================
-- 3. Table: wallets
-- One wallet per user holding spendable & reserved Opx balances
-- ==========================================
CREATE TABLE wallets (
    id                  UUID PRIMARY KEY,
    user_id             UUID NOT NULL UNIQUE,
    balance_opx         BIGINT NOT NULL DEFAULT 0,
    reserved_opx        BIGINT NOT NULL DEFAULT 0,
    version             INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_wallets_balance CHECK (balance_opx >= 0),
    CONSTRAINT chk_wallets_reserved CHECK (reserved_opx >= 0),
    CONSTRAINT chk_wallets_total CHECK (balance_opx + reserved_opx >= 0)
);

CREATE INDEX idx_wallets_user_id ON wallets (user_id);

-- ==========================================
-- 4. Table: transactions
-- Immutable, append-only financial ledger
-- ==========================================
CREATE TABLE transactions (
    id                   UUID PRIMARY KEY,
    wallet_id            UUID NOT NULL REFERENCES wallets(id),
    reference_id         UUID NULL,
    reference_type       VARCHAR(50) NULL,
    type                 VARCHAR(30) NOT NULL,
    status               VARCHAR(30) NOT NULL,
    amount_opx           BIGINT NOT NULL,
    balance_before_opx   BIGINT NOT NULL,
    balance_after_opx    BIGINT NOT NULL,
    description          TEXT NULL,
    metadata             JSONB NULL DEFAULT '{}',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_transactions_amount CHECK (amount_opx > 0),
    CONSTRAINT chk_transactions_type CHECK (type IN ('CREDIT', 'DEBIT', 'HOLD', 'HOLD_RELEASE', 'HOLD_CAPTURE', 'PAYOUT_DEBIT')),
    CONSTRAINT chk_transactions_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED'))
);

CREATE INDEX idx_transactions_wallet_id ON transactions (wallet_id);
CREATE INDEX idx_transactions_wallet_created ON transactions (wallet_id, created_at DESC);
CREATE INDEX idx_transactions_reference ON transactions (reference_id, reference_type);
CREATE INDEX idx_transactions_created_at ON transactions (created_at DESC);

-- ==========================================
-- 5. Table: payment_intents
-- Stripe PaymentIntent sessions for real-money top-ups
-- ==========================================
CREATE TABLE payment_intents (
    id                         UUID PRIMARY KEY,
    wallet_id                  UUID NOT NULL REFERENCES wallets(id),
    idempotency_key_id         UUID NOT NULL REFERENCES idempotency_keys(id),
    stripe_payment_intent_id   VARCHAR(255) NULL UNIQUE,
    status                     VARCHAR(30) NOT NULL,
    amount_opx                 BIGINT NOT NULL,
    amount_usd_cents           BIGINT NOT NULL,
    exchange_rate              NUMERIC(10,6) NOT NULL,
    currency                   VARCHAR(3) NOT NULL DEFAULT 'USD',
    stripe_metadata            JSONB NULL DEFAULT '{}',
    expires_at                 TIMESTAMPTZ NULL,
    completed_at               TIMESTAMPTZ NULL,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_pi_amount_opx CHECK (amount_opx > 0),
    CONSTRAINT chk_pi_amount_usd CHECK (amount_usd_cents > 0),
    CONSTRAINT chk_pi_exchange_rate CHECK (exchange_rate > 0),
    CONSTRAINT chk_pi_status CHECK (status IN ('CREATED', 'PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED'))
);

CREATE INDEX idx_payment_intents_stripe_id ON payment_intents (stripe_payment_intent_id);
CREATE INDEX idx_payment_intents_wallet_id ON payment_intents (wallet_id);
CREATE INDEX idx_payment_intents_status ON payment_intents (status);
CREATE INDEX idx_payment_intents_idempotency ON payment_intents (idempotency_key_id);

-- ==========================================
-- 6. Table: payouts
-- Creator payout requests (Opx -> USD via Stripe Connect)
-- ==========================================
CREATE TABLE payouts (
    id                          UUID PRIMARY KEY,
    wallet_id                   UUID NOT NULL REFERENCES wallets(id),
    idempotency_key_id          UUID NOT NULL REFERENCES idempotency_keys(id),
    stripe_transfer_id          VARCHAR(255) NULL UNIQUE,
    status                      VARCHAR(30) NOT NULL,
    amount_opx                  BIGINT NOT NULL,
    amount_usd_cents            BIGINT NOT NULL,
    exchange_rate               NUMERIC(10,6) NOT NULL,
    stripe_connect_account_id   VARCHAR(255) NOT NULL,
    failure_reason              TEXT NULL,
    processed_at                TIMESTAMPTZ NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_payouts_amount_opx CHECK (amount_opx > 0),
    CONSTRAINT chk_payouts_amount_usd CHECK (amount_usd_cents > 0),
    CONSTRAINT chk_payouts_exchange_rate CHECK (exchange_rate > 0),
    CONSTRAINT chk_payouts_status CHECK (status IN ('REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

CREATE INDEX idx_payouts_stripe_transfer_id ON payouts (stripe_transfer_id);
CREATE INDEX idx_payouts_wallet_id ON payouts (wallet_id);
CREATE INDEX idx_payouts_status ON payouts (status);
CREATE INDEX idx_payouts_idempotency ON payouts (idempotency_key_id);
