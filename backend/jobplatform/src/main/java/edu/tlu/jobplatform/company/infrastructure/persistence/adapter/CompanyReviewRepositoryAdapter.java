package edu.tlu.jobplatform.company.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
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

    // ── Find by ID ──

    @Override
    public Optional<CompanyReview> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toDomain);
    }

    // ── Exists ──

    @Override
    public boolean existsByCompanyIdAndReviewerId(UUID companyId, UUID reviewerId) {
        return jpaRepo.existsByCompanyIdAndReviewerId(companyId, reviewerId);
    }

    // ── Public Queries ──

    @Override
    public Page<CompanyReview> findApprovedAndVisibleByCompanyId(UUID companyId, Pageable pageable) {
        return jpaRepo.findByCompanyIdAndStatusAndVisibleTrue(
                companyId, ReviewStatus.APPROVED, pageable)
                .map(mapper::toDomain);
    }

    // ── Company Management Queries ──

    @Override
    public Page<CompanyReview> findByCompanyIdAndStatus(UUID companyId, ReviewStatus status, Pageable pageable) {
        if (status != null) {
            return jpaRepo.findByCompanyIdAndStatus(companyId, status, pageable)
                    .map(mapper::toDomain);
        }
        return jpaRepo.findByCompanyId(companyId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<CompanyReview> findAllByCompanyId(UUID companyId, Pageable pageable) {
        return jpaRepo.findByCompanyId(companyId, pageable)
                .map(mapper::toDomain);
    }

    // ── User Queries ──

    @Override
    public Page<CompanyReview> findByReviewerId(UUID reviewerId, Pageable pageable) {
        return jpaRepo.findByReviewerId(reviewerId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<CompanyReview> findByReviewerIdAndStatus(UUID reviewerId, ReviewStatus status, Pageable pageable) {
        if (status != null) {
            return jpaRepo.findByReviewerIdAndStatus(reviewerId, status, pageable)
                    .map(mapper::toDomain);
        }
        return jpaRepo.findByReviewerId(reviewerId, pageable)
                .map(mapper::toDomain);
    }

    // ── Admin Queries ──

    @Override
    public Page<CompanyReview> findByStatus(ReviewStatus status, Pageable pageable) {
        if (status != null) {
            return jpaRepo.findByStatus(status, pageable)
                    .map(mapper::toDomain);
        }
        return jpaRepo.findAllByOrderByCreatedAtDesc(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<CompanyReview> findAll(Pageable pageable) {
        return jpaRepo.findAllByOrderByCreatedAtDesc(pageable)
                .map(mapper::toDomain);
    }

    // ── Statistics ──

    @Override
    public Double getAverageRatingByCompanyId(UUID companyId) {
        return jpaRepo.findAverageRatingByCompanyId(companyId);
    }

    @Override
    public long countByCompanyIdAndStatus(UUID companyId, ReviewStatus status) {
        return jpaRepo.countByCompanyIdAndStatus(companyId, status);
    }

    @Override
    public long countByCompanyIdAndRatingAndStatus(UUID companyId, int rating, ReviewStatus status) {
        return jpaRepo.countByCompanyIdAndRatingAndStatus(companyId, rating, status);
    }

    @Override
    public long countByCompanyId(UUID companyId) {
        return jpaRepo.countByCompanyId(companyId);
    }

    // ── Save ──

    @Override
    public CompanyReview save(CompanyReview review) {
        // Update existing
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

    // ── Delete ──

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}