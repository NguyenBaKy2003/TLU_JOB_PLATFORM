package edu.tlu.jobplatform.subscription.domain.service;

import edu.tlu.jobplatform.subscription.domain.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Service: Logic kích hoạt và gia hạn subscription.
 *
 * Tại sao tách ra khỏi UseCase?
 * Logic này phức tạp (carry-over days, quota snapshot) và
 * có thể được tái dùng từ nhiều UseCase khác nhau.
 */
@Service
public class SubscriptionDomainService {

    /**
     * Tạo subscription mới ở trạng thái PENDING.
     * Quota được snapshot từ plan tại thời điểm mua.
     */
    public CompanySubscription createPending(UUID companyId, SubscriptionPlan plan, UUID paymentId) {
        return CompanySubscription.builder()
                .id(UUID.randomUUID())
                .companyId(companyId)
                .planId(plan.getId())
                .planCode(plan.getCode())
                .status(SubscriptionStatus.PENDING)
                .jobPostQuota(Quota.of(plan.getJobPostLimit()))
                .featuredJobQuota(Quota.of(plan.getFeaturedJobLimit()))
                .cvViewQuota(plan.isUnlimitedCvView() ? Quota.unlimited() : Quota.of(plan.getCvViewLimit()))
                .aiFeatures(plan.isAiFeatures())
                .analyticsAccess(plan.isAnalyticsAccess())
                .currentPaymentId(paymentId)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Kích hoạt subscription sau khi thanh toán thành công.
     *
     * Nếu có subscription đang ACTIVE khác → cộng thêm ngày còn lại (carry-over).
     * Ví dụ: còn 5 ngày → endDate mới = now + 30 + 5 = 35 ngày.
     */
    public void activate(CompanySubscription subscription,
            SubscriptionPlan plan,
            Payment payment,
            CompanySubscription existingActive) {

        LocalDateTime newExpiresAt = LocalDateTime.now().plusDays(plan.getDurationDays());

        // Carry-over: cộng thêm ngày còn lại của subscription cũ
        if (existingActive != null && existingActive.isActive()) {
            long carryOverDays = existingActive.daysRemaining();
            if (carryOverDays > 0) {
                newExpiresAt = newExpiresAt.plusDays(carryOverDays);
            }
            existingActive.expire(); // Expire subscription cũ
        }

        // Reset quota theo plan mới
        subscription.activate(payment.getId(), newExpiresAt);
    }
}
