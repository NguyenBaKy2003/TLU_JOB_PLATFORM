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
public class AssignDefaultCompanyPlanUseCase {

    private final CompanySubscriptionRepository subscriptionRepo;
    private final SubscriptionPlanRepository planRepo;

    @Transactional
    public CompanySubscription execute(UUID companyId) {

        // 1. Idempotent — tránh assign 2 lần nếu event bị duplicate
        Optional<CompanySubscription> existing = subscriptionRepo.findActiveByCompanyId(companyId);
        if (existing.isPresent()) {
            log.info("Company already has active subscription, skip: companyId={}", companyId);
            return existing.get();
        }

        // 2. Lấy FREE_COMPANY plan từ DB
        SubscriptionPlan freePlan = planRepo.findByCode(PlanCode.FREE_COMPANY)
                .filter(SubscriptionPlan::isActive)
                .orElseThrow(() -> new IllegalStateException(
                        "FREE_COMPANY plan not found — run DB seed script!"));

        // 3. Tạo thẳng ACTIVE, không qua PENDING (không cần payment)
        CompanySubscription subscription = CompanySubscription.builder()
                .id(UUID.randomUUID())
                .companyId(companyId)
                .planId(freePlan.getId())
                .planCode(freePlan.getCode())
                .yearly(false)
                .status(SubscriptionStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .expiresAt(null) // Free = vĩnh viễn
                .jobPostQuota(Quota.of(freePlan.getJobPostLimit()))
                .featuredJobQuota(Quota.of(freePlan.getFeaturedJobLimit()))
                .cvViewQuota(Quota.of(freePlan.getCvViewLimit()))
                .aiFeatures(freePlan.isAiFeatures())
                .analyticsAccess(freePlan.isAnalyticsAccess())
                .createdAt(LocalDateTime.now())
                .build();

        CompanySubscription saved = subscriptionRepo.save(subscription);
        log.info("FREE_COMPANY plan assigned: companyId={}", companyId);
        return saved;
    }
}