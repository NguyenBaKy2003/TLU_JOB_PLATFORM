package edu.tlu.jobplatform.subscription.infrastructure.persistence.repository;

import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.SubscriptionPlanJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanJpaRepo
        extends JpaRepository<SubscriptionPlanJpaEntity, UUID> {

    Optional<SubscriptionPlanJpaEntity> findByCode(String code);

    List<SubscriptionPlanJpaEntity> findByIsActiveTrueOrderByPriceMonthlyAsc();
}
