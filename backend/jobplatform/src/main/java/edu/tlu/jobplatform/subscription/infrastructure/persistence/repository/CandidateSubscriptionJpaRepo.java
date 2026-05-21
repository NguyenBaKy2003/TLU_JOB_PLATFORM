package edu.tlu.jobplatform.subscription.infrastructure.persistence.repository;

import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionStatus;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.CandidateSubscriptionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateSubscriptionJpaRepo
        extends JpaRepository<CandidateSubscriptionJpaEntity, UUID> {

    Optional<CandidateSubscriptionJpaEntity> findByCandidateIdAndStatus(
            UUID candidateId, CandidateSubscriptionStatus status);

    List<CandidateSubscriptionJpaEntity> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId);

    List<CandidateSubscriptionJpaEntity> findByStatusAndExpiresAtBefore(
            CandidateSubscriptionStatus status, LocalDateTime threshold);

    /**
     * Tìm ACTIVE subscriptions cần reset quota tháng.
     * Điều kiện: lastQuotaResetAt IS NULL hoặc lastQuotaResetAt < threshold.
     * threshold thường là (now - 1 tháng).
     */
    @Query("""
            SELECT s FROM CandidateSubscriptionJpaEntity s
            WHERE s.status = 'ACTIVE'
              AND (s.lastQuotaResetAt IS NULL OR s.lastQuotaResetAt < :threshold)
            """)
    List<CandidateSubscriptionJpaEntity> findActiveNeedingQuotaReset(
            @Param("threshold") LocalDateTime threshold);
}