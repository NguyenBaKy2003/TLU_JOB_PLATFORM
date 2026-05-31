package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Admin quản lý Candidate subscription:
 * - Xem danh sách tất cả / theo candidate
 * - Xem subscription active của candidate
 * - Thu hồi subscription vi phạm
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCandidateSubscriptionUseCase {

    private final CandidateSubscriptionRepository subscriptionRepo;

    // ── List ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<CandidateSubscription> listAll(Pageable pageable) {
        Page<CandidateSubscription> page = subscriptionRepo.findAll(pageable);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public List<CandidateSubscription> listByCandidate(UUID candidateId) {
        return subscriptionRepo.findByCandidate(candidateId);
    }

    @Transactional(readOnly = true)
    public CandidateSubscription getActive(UUID candidateId) {
        return subscriptionRepo.findActiveByCandidate(candidateId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Candidate này không có subscription đang active.", "NO_ACTIVE_SUBSCRIPTION"));
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    /** Thu hồi subscription vi phạm */
    @Transactional
    public CandidateSubscription revoke(UUID candidateId, String reason) {
        if (reason == null || reason.isBlank())
            throw new BusinessRuleException("Vui lòng nhập lý do thu hồi.", "REASON_REQUIRED");

        CandidateSubscription sub = getActive(candidateId);
        sub.cancel();
        CandidateSubscription saved = subscriptionRepo.save(sub);

        log.warn("Admin revoked candidate subscription: candidateId={} reason='{}'",
                candidateId, reason);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<CandidateSubscription> listAllForExport() {
        return subscriptionRepo
                .findAll(PageRequest.of(0, Integer.MAX_VALUE, Sort.by("createdAt").descending()))
                .getContent();
    }

}