package edu.tlu.jobplatform.company.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyReviewJpaEntity;
import edu.tlu.jobplatform.company.infrastructure.persistence.mapper.CompanyReviewMapper;
import edu.tlu.jobplatform.company.infrastructure.persistence.repository.CompanyReviewJpaRepository;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CompanyReviewRepositoryAdapter implements CompanyReviewRepository {

    private final CompanyReviewJpaRepository jpaRepo;
    private final CompanyReviewMapper mapper;

    // ── Exists ─────────────────────────────────────────

    @Override
    public boolean existsByCompanyIdAndReviewerId(UUID companyId, UUID reviewerId) {
        return jpaRepo.existsByCompanyIdAndReviewerId(companyId, reviewerId);
    }

    // ── Query ──────────────────────────────────────────

    @Override
    public Page<CompanyReview> findVisibleByCompanyId(UUID companyId, Pageable pageable) {
        return jpaRepo.findByCompanyIdAndVisibleTrue(companyId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Double getAverageRatingByCompanyId(UUID companyId) {
        return jpaRepo.findAverageRatingByCompanyId(companyId);
    }

    // ── Find ───────────────────────────────────────────

    @Override
    public Optional<CompanyReview> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toDomain);
    }

    // ── Save ───────────────────────────────────────────

    @Override
    public CompanyReview save(CompanyReview review) {

        // Update
        if (review.getId() != null) {
            Optional<CompanyReviewJpaEntity> existing = jpaRepo.findById(review.getId());
            if (existing.isPresent()) {
                CompanyReviewJpaEntity entity = existing.get();
                mapper.updateEntity(entity, review);
                return mapper.toDomain(jpaRepo.save(entity));
            }
        }

        // Create new
        CompanyReviewJpaEntity newEntity = mapper.toNewEntity(review);
        return mapper.toDomain(jpaRepo.save(newEntity));
    }

    // ── Delete ─────────────────────────────────────────

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}