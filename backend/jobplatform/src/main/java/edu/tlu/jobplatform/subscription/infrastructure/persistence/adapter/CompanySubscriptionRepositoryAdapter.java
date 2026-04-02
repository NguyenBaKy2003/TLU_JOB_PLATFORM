package edu.tlu.jobplatform.subscription.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper.SubscriptionMapper;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

// ── CompanySubscription Adapter ───────────────────────────────

@Component
@RequiredArgsConstructor
public class CompanySubscriptionRepositoryAdapter implements CompanySubscriptionRepository {

    private final CompanySubscriptionJpaRepo jpaRepo;
    private final SubscriptionMapper mapper;

    @Override
    public Optional<CompanySubscription> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toSubDomain);
    }

    @Override
    public Optional<CompanySubscription> findActiveByCompanyId(UUID companyId) {
        return jpaRepo.findActiveByCompanyId(companyId).map(mapper::toSubDomain);
    }

    @Override
    public List<CompanySubscription> findByCompanyId(UUID companyId) {
        return jpaRepo.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(mapper::toSubDomain).collect(Collectors.toList());
    }

    @Override
    public List<CompanySubscription> findByStatusAndExpiresAtBefore(
            SubscriptionStatus status, LocalDateTime threshold) {
        return jpaRepo.findByStatusAndExpiresAtBefore(status, threshold)
                .stream().map(mapper::toSubDomain).collect(Collectors.toList());
    }

    @Override
    public CompanySubscription save(CompanySubscription sub) {
        CompanySubscriptionJpaEntity entity = jpaRepo.findById(sub.getId())
                .map(e -> {
                    mapper.updateSubEntity(e, sub);
                    return e;
                })
                .orElseGet(() -> mapper.toSubNewEntity(sub));
        return mapper.toSubDomain(jpaRepo.save(entity));
    }
}
