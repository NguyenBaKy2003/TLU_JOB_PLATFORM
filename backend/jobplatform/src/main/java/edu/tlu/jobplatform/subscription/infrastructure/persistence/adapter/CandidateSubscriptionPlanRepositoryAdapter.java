package edu.tlu.jobplatform.subscription.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionPlanRepository;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.CandidateSubscriptionPlanJpaEntity;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper.CandidateSubscriptionMapper;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.repository.CandidateSubscriptionPlanJpaRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CandidateSubscriptionPlanRepositoryAdapter
        implements CandidateSubscriptionPlanRepository {

    private final CandidateSubscriptionPlanJpaRepo jpaRepo;
    private final CandidateSubscriptionMapper mapper;

    @Override
    public List<CandidateSubscriptionPlan> findAllActive() {
        return jpaRepo.findByIsActiveTrueOrderByPriceMonthlyAsc()
                .stream().map(mapper::toPlanDomain).toList();
    }

    @Override
    public List<CandidateSubscriptionPlan> findAll() {
        return jpaRepo.findAll().stream().map(mapper::toPlanDomain).toList();
    }

    @Override
    public Optional<CandidateSubscriptionPlan> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toPlanDomain);
    }

    @Override
    public Optional<CandidateSubscriptionPlan> findByCode(String code) {
        return jpaRepo.findByCode(code).map(mapper::toPlanDomain);
    }

    @Override
    public CandidateSubscriptionPlan save(CandidateSubscriptionPlan plan) {
        if (plan.getId() != null) {
            Optional<CandidateSubscriptionPlanJpaEntity> existing = jpaRepo.findById(plan.getId());
            if (existing.isPresent()) {
                CandidateSubscriptionPlanJpaEntity e = existing.get();
                mapper.updatePlanEntity(e, plan);
                return mapper.toPlanDomain(jpaRepo.save(e));
            }
        }
        return mapper.toPlanDomain(jpaRepo.save(mapper.toPlanNewEntity(plan)));
    }
}