package edu.tlu.jobplatform.subscription.infrastructure.persistence.repository;

import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentJpaRepo extends JpaRepository<PaymentJpaEntity, UUID> {
    Optional<PaymentJpaEntity> findByGatewayOrderCode(String orderCode);
}