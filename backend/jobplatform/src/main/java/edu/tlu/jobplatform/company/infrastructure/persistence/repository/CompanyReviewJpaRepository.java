package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyReviewJpaEntity;

import java.util.UUID;

@Repository
public interface CompanyReviewJpaRepository extends JpaRepository<CompanyReviewJpaEntity, UUID> {

    boolean existsByCompanyIdAndReviewerId(UUID companyId, UUID reviewerId);

    Page<CompanyReviewJpaEntity> findByCompanyIdAndVisibleTrue(UUID companyId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM CompanyReviewJpaEntity r WHERE r.companyId = :companyId AND r.visible = true")
    Double findAverageRatingByCompanyId(UUID companyId);
}