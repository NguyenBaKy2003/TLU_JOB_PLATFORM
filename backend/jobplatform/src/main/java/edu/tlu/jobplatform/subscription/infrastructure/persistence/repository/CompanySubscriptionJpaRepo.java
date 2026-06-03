package edu.tlu.jobplatform.subscription.infrastructure.persistence.repository;

import edu.tlu.jobplatform.subscription.domain.model.SubscriptionStatus;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.CompanySubscriptionJpaEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanySubscriptionJpaRepo
                extends JpaRepository<CompanySubscriptionJpaEntity, UUID> {

        Optional<CompanySubscriptionJpaEntity> findByCompanyIdAndStatus(
                        UUID companyId, SubscriptionStatus status);

        List<CompanySubscriptionJpaEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

        List<CompanySubscriptionJpaEntity> findByPlanCode(String planCode);

        List<CompanySubscriptionJpaEntity> findByStatusAndExpiresAtBefore(
                        SubscriptionStatus status, LocalDateTime threshold);

        @Query("""
                        SELECT s FROM CompanySubscriptionJpaEntity s
                        WHERE (:status IS NULL OR s.status = :status)
                          AND (:keyword IS NULL OR :keyword = ''
                               OR LOWER(s.planCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                               OR CAST(s.companyId AS string) LIKE LOWER(CONCAT('%', :keyword, '%')))
                        ORDER BY s.createdAt DESC
                        """)
        Page<CompanySubscriptionJpaEntity> findByKeywordAndStatus(
                        @Param("keyword") String keyword,
                        @Param("status") SubscriptionStatus status,
                        Pageable pageable);
}