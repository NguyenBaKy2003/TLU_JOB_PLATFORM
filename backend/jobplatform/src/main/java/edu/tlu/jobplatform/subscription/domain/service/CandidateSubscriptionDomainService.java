package edu.tlu.jobplatform.subscription.domain.service;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.subscription.domain.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CandidateSubscriptionDomainService {

    /**
     * Tạo subscription PENDING — snapshot quota + flags từ plan tại thời điểm mua.
     */
    public CandidateSubscription createPending(UUID candidateId,
            CandidateSubscriptionPlan plan,
            UUID paymentId,
            boolean yearly) {
        return CandidateSubscription.builder()
                .id(UUID.randomUUID())
                .candidateId(candidateId)
                .planId(plan.getId())
                .planCode(plan.getCode())
                .yearly(yearly)
                .status(CandidateSubscriptionStatus.PENDING)
                // snapshot quota
                .applicationQuota(plan.isUnlimitedApplications()
                        ? CandidateQuota.unlimited()
                        : CandidateQuota.of(plan.getApplicationLimit()))
                .cvBoostQuota(CandidateQuota.of(plan.getCvBoostLimit()))
                .cvCreateQuota(plan.isUnlimitedCvCreate()
                        ? CandidateQuota.unlimited()
                        : CandidateQuota.of(plan.getCvCreateLimit()))
                // snapshot feature flags
                .aiCvWriter(plan.isAiCvWriter())
                .premiumTemplateAccess(plan.isPremiumTemplateAccess())
                .currentPaymentId(paymentId)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Kích hoạt sau thanh toán thành công.
     * Carry-over: cộng thêm ngày còn lại của subscription cũ nếu có.
     */
    public void activate(CandidateSubscription subscription,
            CandidateSubscriptionPlan plan,
            Payment payment,
            CandidateSubscription existingActive) {

        LocalDateTime newExpiresAt = subscription.isYearly()
                ? LocalDateTime.now().plusYears(1)
                : LocalDateTime.now().plusMonths(1);

        if (existingActive != null && existingActive.isActive()) {
            long carryOverDays = existingActive.daysRemaining();
            if (carryOverDays > 0 && carryOverDays != Long.MAX_VALUE) {
                newExpiresAt = newExpiresAt.plusDays(carryOverDays);
            }
            existingActive.expire();
        }

        subscription.activate(payment.getId(), newExpiresAt);
    }
}