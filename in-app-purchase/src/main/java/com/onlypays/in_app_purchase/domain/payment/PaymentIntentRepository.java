package com.onlypays.in_app_purchase.domain.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, UUID> {

    Optional<PaymentIntent> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<PaymentIntent> findByWalletId(UUID walletId);

    List<PaymentIntent> findByStatus(PaymentIntentStatus status);
}
