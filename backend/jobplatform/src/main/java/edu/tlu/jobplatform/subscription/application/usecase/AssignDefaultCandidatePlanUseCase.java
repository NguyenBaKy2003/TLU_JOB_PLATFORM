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

        // 2. Lấy FREE_CANDIDATE plan
        CandidateSubscriptionPlan freePlan = planRepo.findByCode(PlanCode.FREE_CANDIDATE)
                .filter(CandidateSubscriptionPlan::isActive)
                .orElseThrow(() -> new IllegalStateException(
                        "FREE_CANDIDATE plan not found — run DB seed script!"));

        // 3. Tạo thẳng ACTIVE
        CandidateSubscription subscription = CandidateSubscription.builder()
                .id(UUID.randomUUID())
                .candidateId(candidateId)
                .planId(freePlan.getId())
                .planCode(freePlan.getCode())
                .yearly(false)
                .status(CandidateSubscriptionStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .expiresAt(null) // Free = vĩnh viễn
                .applicationQuota(CandidateQuota.of(freePlan.getApplicationLimit()))
                .cvBoostQuota(CandidateQuota.of(freePlan.getCvBoostLimit()))
                .jobAlertQuota(CandidateQuota.of(freePlan.getJobAlertLimit()))
                .mockInterviewQuota(CandidateQuota.of(freePlan.getMockInterviewLimit()))
                .aiCvWriter(freePlan.isAiCvWriter())
                .salaryInsights(freePlan.isSalaryInsights())
                .profileAnalytics(freePlan.isProfileAnalytics())
                .advancedFilters(freePlan.isAdvancedFilters())
                .createdAt(LocalDateTime.now())
                .lastQuotaResetAt(LocalDateTime.now())
                .build();

        CandidateSubscription saved = subscriptionRepo.save(subscription);
        log.info("FREE_CANDIDATE plan assigned: candidateId={}", candidateId);
        return saved;
    }
}