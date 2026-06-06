package edu.tlu.jobplatform.subscription.domain.repository;

import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateSubscriptionRepository {

    Optional<CandidateSubscription> findById(UUID id);

    /** Tìm subscription ACTIVE hiện tại của candidate */
    Optional<CandidateSubscription> findActiveByCandidate(UUID candidateId);

    /** Lịch sử tất cả subscription của candidate, mới nhất trước */
    List<CandidateSubscription> findByCandidate(UUID candidateId);

    /** Phân trang — admin dùng */
    Page<CandidateSubscription> findAll(Pageable pageable);

    /**
     * Tìm các ACTIVE subscription cần reset quota hàng tháng.
     * Điều kiện: lastQuotaResetAt < threshold (đã qua 1 tháng kể từ lần reset
     * trước).
     */
    List<CandidateSubscription> findActiveForQuotaReset(LocalDateTime threshold);

    /**
     * Tìm ACTIVE subscription sắp hết hạn — scheduler expire dùng.
     */
    List<CandidateSubscription> findByStatusAndExpiresAtBefore(
            CandidateSubscriptionStatus status, LocalDateTime threshold);

    CandidateSubscription save(CandidateSubscription subscription);

    Page<CandidateSubscription> findByKeywordAndStatus(String keyword, CandidateSubscriptionStatus status,
            Pageable pageable);
}