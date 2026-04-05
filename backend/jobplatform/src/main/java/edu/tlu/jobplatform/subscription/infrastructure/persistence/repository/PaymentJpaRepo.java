package edu.tlu.jobplatform.subscription.infrastructure.persistence.repository;

import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.PaymentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PaymentJpaRepo extends JpaRepository<PaymentJpaEntity, UUID> {

    Optional<PaymentJpaEntity> findByGatewayOrderCode(String gatewayOrderCode);

    @Query("""
            SELECT p FROM PaymentJpaEntity p
            WHERE p.companyId = :companyId
              AND p.status = 'PENDING'
            ORDER BY p.createdAt DESC
            LIMIT 1
            """)
    Optional<PaymentJpaEntity> findPendingByCompanyId(@Param("companyId") UUID companyId);
}