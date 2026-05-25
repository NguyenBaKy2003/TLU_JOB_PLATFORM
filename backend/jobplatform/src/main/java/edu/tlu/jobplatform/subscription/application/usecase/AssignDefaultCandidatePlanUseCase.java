package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssignDefaultCandidatePlanUseCase {

    private final CandidateSubscriptionRepository subscriptionRepo;
    private final CandidateSubscriptionPlanRepository planRepo;

    @Transactional
    public CandidateSubscription execute(UUID candidateId) {

        // 1. Idempotent check
        Optional<CandidateSubscription> existing = subscriptionRepo.findActiveByCandidate(candidateId);
        if (existing.isPresent()) {
            log.info("Candidate already has active subscription, skip: candidateId={}", candidateId);
            return existing.get();
        }

        // 2. Lấy FREE_CANDIDATE plan (free plan mặc định)
        CandidateSubscriptionPlan basicPlan = planRepo.findByCode("FREE_CANDIDATE")
                .filter(CandidateSubscriptionPlan::isActive)
                .orElseThrow(() -> new IllegalStateException(
                        "FREE_CANDIDATE plan not found — run DB seed script!"));

        // 3. Xác định expiry date dựa trên durationDays
        LocalDateTime expiresAt = null;
        if (basicPlan.getDurationDays() != null) {
            expiresAt = LocalDateTime.now().plusDays(basicPlan.getDurationDays());
        }
        // Nếu durationDays = null (free plan vĩnh viễn) thì expiresAt = null

        // 4. Tạo subscription với status ACTIVE
        CandidateSubscription subscription = CandidateSubscription.builder()
                .id(UUID.randomUUID())
                .candidateId(candidateId)
                .planId(basicPlan.getId())
                .planCode(basicPlan.getCode())
                .yearly(false)
                .status(CandidateSubscriptionStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .applicationQuota(CandidateQuota.of(basicPlan.getApplicationLimit()))
                .cvBoostQuota(CandidateQuota.of(basicPlan.getCvBoostLimit()))
                .cvCreateQuota(CandidateQuota.of(basicPlan.getCvCreateLimit()))
                .aiCvWriter(basicPlan.isAiCvWriter())
                .premiumTemplateAccess(basicPlan.isPremiumTemplateAccess())
                .createdAt(LocalDateTime.now())
                .lastQuotaResetAt(LocalDateTime.now())
                .build();

        CandidateSubscription saved = subscriptionRepo.save(subscription);
        log.info("FREE_CANDIDATE plan assigned: candidateId={}, planCode={}, expiresAt={}",
                candidateId, basicPlan.getCode(), expiresAt);
        return saved;
    }
}