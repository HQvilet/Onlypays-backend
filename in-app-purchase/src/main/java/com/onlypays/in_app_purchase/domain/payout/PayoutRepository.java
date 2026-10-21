package com.onlypays.in_app_purchase.domain.payout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, UUID> {

    Optional<Payout> findByStripeTransferId(String stripeTransferId);

    List<Payout> findByWalletId(UUID walletId);

    List<Payout> findByStatus(PayoutStatus status);
}
