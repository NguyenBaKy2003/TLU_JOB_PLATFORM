package edu.tlu.jobplatform.subscription.domain.repository;

import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionPlanRepository {
    List<SubscriptionPlan> findAllActive();

    Optional<SubscriptionPlan> findById(UUID id);

    Optional<SubscriptionPlan> findByCode(String code);

    SubscriptionPlan save(SubscriptionPlan plan);
}