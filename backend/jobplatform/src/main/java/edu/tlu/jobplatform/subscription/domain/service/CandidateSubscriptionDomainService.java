package edu.tlu.jobplatform.subscription.domain.service;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.subscription.domain.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Service: Logic tạo và kích hoạt CandidateSubscription.
 *
 * Tách ra khỏi UseCase vì:
 * - Logic activate (carry-over, quota snapshot) có thể dùng lại
 * từ nhiều UseCase (purchase, admin force-activate, renewal).
 * - Test domain logic độc lập với Spring context.
 *
 * Tương tự SubscriptionDomainService của Company nhưng:
 * - Snapshot quota theo CandidateSubscriptionPlan fields
 * - Carry-over days vẫn áp dụng
 * - lastQuotaResetAt set tại thời điểm activate
 */
@Service
public class CandidateSubscriptionDomainService {

    /**
     * Tạo subscription mới ở trạng thái PENDING.
     * Quota được snapshot từ plan tại thời điểm mua — không bị ảnh hưởng
     * nếu admin đổi plan sau này.
     *
     * @param yearly true = gói năm, false = gói tháng
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
                // snapshot quota từ plan
                .applicationQuota(plan.isUnlimitedApplications()
                        ? CandidateQuota.unlimited()
                        : CandidateQuota.of(plan.getApplicationLimit()))
                .cvBoostQuota(CandidateQuota.of(plan.getCvBoostLimit()))
                .jobAlertQuota(plan.isUnlimitedJobAlerts()
                        ? CandidateQuota.unlimited()
                        : CandidateQuota.of(plan.getJobAlertLimit()))
                .mockInterviewQuota(CandidateQuota.of(plan.getMockInterviewLimit()))
                // snapshot feature flags
                .aiCvWriter(plan.isAiCvWriter())
                .salaryInsights(plan.isSalaryInsights())
                .profileAnalytics(plan.isProfileAnalytics())
                .advancedFilters(plan.isAdvancedFilters())
                .currentPaymentId(paymentId)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Kích hoạt subscription sau khi thanh toán thành công.
     *
     * expiresAt tính tại thời điểm activate (không phải lúc tạo PENDING)
     * vì candidate có thể thanh toán vài ngày sau khi tạo đơn.
     *
     * Carry-over: nếu đang có subscription ACTIVE còn thời hạn,
     * cộng thêm số ngày còn lại vào gói mới — nhất quán với Company logic.
     *
     * @param existingActive subscription ACTIVE hiện tại (có thể null)
     */
    public void activate(CandidateSubscription subscription,
            CandidateSubscriptionPlan plan,
            Payment payment,
            CandidateSubscription existingActive) {

        LocalDateTime newExpiresAt = subscription.isYearly()
                ? LocalDateTime.now().plusYears(1)
                : LocalDateTime.now().plusMonths(1);

        // Carry-over days từ subscription cũ
        if (existingActive != null && existingActive.isActive()) {
            long carryOverDays = existingActive.daysRemaining();
            if (carryOverDays > 0) {
                newExpiresAt = newExpiresAt.plusDays(carryOverDays);
            }
            existingActive.expire();
        }

        subscription.activate(payment.getId(), newExpiresAt);
    }
}