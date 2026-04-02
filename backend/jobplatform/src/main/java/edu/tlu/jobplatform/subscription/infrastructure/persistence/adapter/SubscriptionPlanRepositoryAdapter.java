package edu.tlu.jobplatform.subscription.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper.SubscriptionMapper;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

// ── SubscriptionPlan Adapter ──────────────────────────────────

@Component
@RequiredArgsConstructor
public class SubscriptionPlanRepositoryAdapter implements SubscriptionPlanRepository {

    private final SubscriptionPlanJpaRepo jpaRepo;
    private final SubscriptionMapper mapper;

    @Override
    public List<SubscriptionPlan> findAllActive() {
        return jpaRepo.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream().map(mapper::toPlanDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<SubscriptionPlan> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toPlanDomain);
    }

    @Override
    public Optional<SubscriptionPlan> findByCode(String code) {
        return jpaRepo.findByCode(code).map(mapper::toPlanDomain);
    }

    @Override
    public SubscriptionPlan save(SubscriptionPlan p) {
        return mapper.toPlanDomain(jpaRepo.save(mapper.toPlanEntity(p)));
    }
}
