package edu.tlu.jobplatform.subscription.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionStatus;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.CandidateSubscriptionJpaEntity;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper.CandidateSubscriptionMapper;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.repository.CandidateSubscriptionJpaRepo;
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
public class CandidateSubscriptionRepositoryAdapter
        implements CandidateSubscriptionRepository {

    private final CandidateSubscriptionJpaRepo jpaRepo;
    private final CandidateSubscriptionMapper mapper;

    @Override
    public Optional<CandidateSubscription> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<CandidateSubscription> findActiveByCandidate(UUID candidateId) {
        return jpaRepo.findByCandidateIdAndStatus(candidateId, CandidateSubscriptionStatus.ACTIVE)
                .map(mapper::toDomain);
    }

    @Override
    public List<CandidateSubscription> findByCandidate(UUID candidateId) {
        return jpaRepo.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public Page<CandidateSubscription> findAll(Pageable pageable) {
        return jpaRepo.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public List<CandidateSubscription> findActiveForQuotaReset(LocalDateTime threshold) {
        return jpaRepo.findActiveNeedingQuotaReset(threshold)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<CandidateSubscription> findByStatusAndExpiresAtBefore(
            CandidateSubscriptionStatus status, LocalDateTime threshold) {
        return jpaRepo.findByStatusAndExpiresAtBefore(status, threshold)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public CandidateSubscription save(CandidateSubscription sub) {
        if (sub.getId() != null) {
            Optional<CandidateSubscriptionJpaEntity> existing = jpaRepo.findById(sub.getId());
            if (existing.isPresent()) {
                CandidateSubscriptionJpaEntity e = existing.get();
                mapper.updateEntity(e, sub);
                return mapper.toDomain(jpaRepo.save(e));
            }
        }
        return mapper.toDomain(jpaRepo.save(mapper.toNewEntity(sub)));
    }

    @Override
    public Page<CandidateSubscription> findByKeywordAndStatus(
            String keyword, CandidateSubscriptionStatus status, Pageable pageable) {
        return jpaRepo.findByKeywordAndStatus(keyword, status, pageable)
                .map(mapper::toDomain);
    }
}