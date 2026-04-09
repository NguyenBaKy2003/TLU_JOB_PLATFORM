package edu.tlu.jobplatform.subscription.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.SubscriptionPlanJpaEntity;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper.SubscriptionMapper;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// ── SubscriptionPlanRepositoryAdapter ────────────────────────────

@Component
@RequiredArgsConstructor
public class SubscriptionPlanRepositoryAdapter implements SubscriptionPlanRepository {

    private final SubscriptionPlanJpaRepo jpaRepo;
    private final SubscriptionMapper mapper;

    @Override
    public List<SubscriptionPlan> findAllActive() {
        return jpaRepo.findByIsActiveTrueOrderByPriceMonthlyAsc()
                .stream().map(mapper::toPlanDomain).toList();
    }

    @Override
    public List<SubscriptionPlan> findAll() {
        return jpaRepo.findAll().stream().map(mapper::toPlanDomain).toList();
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
        if (p.getId() != null) {
            Optional<SubscriptionPlanJpaEntity> existing = jpaRepo.findById(p.getId());
            if (existing.isPresent()) {
                SubscriptionPlanJpaEntity e = existing.get();
                e.setCode(p.getCode());
                e.setName(p.getName());
                e.setDescription(p.getDescription());
                e.setPriceMonthly(p.getPriceMonthly());
                e.setPriceYearly(p.getPriceYearly());
                e.setJobPostLimit(p.getJobPostLimit());
                e.setFeaturedJobLimit(p.getFeaturedJobLimit());
                e.setCvViewLimit(p.getCvViewLimit());
                e.setAiFeatures(p.isAiFeatures());
                e.setAnalyticsAccess(p.isAnalyticsAccess());
                e.setDurationDays(p.getDurationDays());
                e.setIsActive(p.isActive());
                return mapper.toPlanDomain(jpaRepo.save(e));
            }
        }

        SubscriptionPlanJpaEntity newEntity = mapper.toPlanEntity(p);
        return mapper.toPlanDomain(jpaRepo.save(newEntity));
    }
}
