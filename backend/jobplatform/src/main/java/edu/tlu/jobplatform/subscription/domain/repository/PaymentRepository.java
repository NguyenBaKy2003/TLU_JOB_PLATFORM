package edu.tlu.jobplatform.subscription.domain.repository;

import edu.tlu.jobplatform.subscription.domain.model.Payment;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository {
    Optional<Payment> findById(UUID id);

    Optional<Payment> findByGatewayOrderCode(String orderCode);

    Payment save(Payment payment);
}