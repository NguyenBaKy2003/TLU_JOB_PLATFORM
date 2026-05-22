package edu.tlu.jobplatform.subscription.infrastructure.persistence.repository;

import edu.tlu.jobplatform.subscription.domain.model.SubscriptionStatus;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.CompanySubscriptionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanySubscriptionJpaRepo
                extends JpaRepository<CompanySubscriptionJpaEntity, UUID> {

        Optional<CompanySubscriptionJpaEntity> findByCompanyIdAndStatus(
                        UUID companyId, SubscriptionStatus status);

        List<CompanySubscriptionJpaEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

        List<CompanySubscriptionJpaEntity> findByPlanCode(String planCode);

        List<CompanySubscriptionJpaEntity> findByStatusAndExpiresAtBefore(
                        SubscriptionStatus status, LocalDateTime threshold);
}