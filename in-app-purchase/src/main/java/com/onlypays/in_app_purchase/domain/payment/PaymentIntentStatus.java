package com.onlypays.in_app_purchase.domain.payment;

public enum PaymentIntentStatus {
    CREATED,
    PENDING,
    PROCESSING,
    SUCCEEDED,
    FAILED,
    CANCELLED,
    REFUNDED
}
