package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionStatus;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import edu.tlu.jobplatform.subscription.presentation.dto.response.CandidateSubscriptionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
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
    private final CandidateProfileRepository candidateProfileRepository;
    // ── List ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<CandidateSubscriptionResponse> listAll(
            String keyword, CandidateSubscriptionStatus status, Pageable pageable) {
        return PageResponse.from(
                subscriptionRepo.findByKeywordAndStatus(keyword, status, pageable)
                        .map(sub -> {
                            CandidateProfile profile = candidateProfileRepository
                                    .findByUserId(sub.getCandidateId()).orElse(null);
                            return CandidateSubscriptionResponse.from(sub, profile);
                        }));
    }

    @Transactional(readOnly = true)
    public List<CandidateSubscriptionResponse> listByCandidate(UUID candidateId) {
        CandidateProfile profile = candidateProfileRepository
                .findByUserId(candidateId).orElse(null);
        return subscriptionRepo.findByCandidate(candidateId).stream()
                .map(sub -> CandidateSubscriptionResponse.from(sub, profile))
                .toList();
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