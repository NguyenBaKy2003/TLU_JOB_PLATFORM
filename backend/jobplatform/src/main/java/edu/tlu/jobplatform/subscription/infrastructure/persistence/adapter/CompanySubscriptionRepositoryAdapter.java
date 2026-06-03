package edu.tlu.jobplatform.subscription.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper.SubscriptionMapper;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CompanySubscriptionRepositoryAdapter implements CompanySubscriptionRepository {

    private final CompanySubscriptionJpaRepo jpaRepo;
    private final SubscriptionMapper mapper;

    @Override
    public Page<CompanySubscription> findAll(Pageable pageable) {
        return jpaRepo.findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<CompanySubscription> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<CompanySubscription> findByPlanCode(String planCode) {
        return jpaRepo.findByPlanCode(planCode)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<CompanySubscription> findActiveByCompanyId(UUID companyId) {
        // fix: truyền enum thay vì dùng JPQL string literal
        return jpaRepo.findByCompanyIdAndStatus(companyId, SubscriptionStatus.ACTIVE)
                .map(mapper::toDomain);
    }

    @Override
    public List<CompanySubscription> findByCompanyId(UUID companyId) {
        return jpaRepo.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<CompanySubscription> findByStatusAndExpiresAtBefore(
            SubscriptionStatus status, LocalDateTime threshold) {
        return jpaRepo.findByStatusAndExpiresAtBefore(status, threshold)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public CompanySubscription save(CompanySubscription sub) {
        if (sub.getId() != null && jpaRepo.existsById(sub.getId())) {
            CompanySubscriptionJpaEntity e = jpaRepo.getReferenceById(sub.getId());
            mapper.updateEntity(e, sub);
            return mapper.toDomain(jpaRepo.save(e));
        }
        return mapper.toDomain(jpaRepo.save(mapper.toNewEntity(sub)));
    }

    @Override
    public Page<CompanySubscription> findByKeywordAndStatus(
            String keyword, SubscriptionStatus status, Pageable pageable) {
        return jpaRepo.findByKeywordAndStatus(keyword, status, pageable)
                .map(mapper::toDomain);
    }
}