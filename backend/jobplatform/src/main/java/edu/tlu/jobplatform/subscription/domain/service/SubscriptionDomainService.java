package edu.tlu.jobplatform.subscription.domain.service;

import edu.tlu.jobplatform.subscription.domain.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Service: Quản lý vòng đời subscription.
 * Activate, expire, renew — logic phức tạp tách ra service riêng.
 */
@Service
public class SubscriptionDomainService {

    /**
     * Kích hoạt subscription sau khi thanh toán thành công.
     * Nếu đang có subscription cũ chưa hết hạn → cộng thêm thời gian.
     *
     * @param sub      subscription vừa được thanh toán
     * @param plan     plan details
     * @param payment  payment đã thành công
     * @param existing subscription đang active (nếu có)
     */
    public void activate(CompanySubscription sub, SubscriptionPlan plan,
            Payment payment, CompanySubscription existing) {

        LocalDateTime startFrom;

        if (existing != null && existing.isActive()) {
            // Nếu gia hạn trước khi hết: cộng thêm vào ngày hết hạn cũ
            startFrom = existing.getExpiresAt();
            existing.expire(); // close subscription cũ
        } else {
            startFrom = LocalDateTime.now();
        }

        LocalDateTime expiresAt = startFrom.plusDays(plan.getDurationDays());
        sub.activate(payment.getId(), expiresAt);
    }

    /**
     * Đánh dấu subscription đã hết hạn.
     * Được gọi bởi scheduler hoặc khi check thủ công.
     */
    public void expire(CompanySubscription sub) {
        if (sub.isExpired()) {
            sub.expire();
        }
    }

    /**
     * Tạo CompanySubscription mới ở trạng thái PENDING.
     * Chưa activate — chờ payment callback.
     */
    public CompanySubscription createPending(UUID companyId, SubscriptionPlan plan, UUID paymentId) {
        return CompanySubscription.builder()
                .id(UUID.randomUUID())
                .companyId(companyId)
                .planId(plan.getId())
                .planCode(plan.getCode())
                .status(SubscriptionStatus.PENDING)
                // Snapshot quota từ plan
                .jobPostQuota(plan.isUnlimitedJobs()
                        ? Quota.unlimited()
                        : Quota.of(plan.getJobPostLimit(), 0))
                .featuredJobQuota(Quota.of(plan.getFeaturedJobLimit(), 0))
                .cvViewQuota(plan.isUnlimitedCvView()
                        ? Quota.unlimited()
                        : Quota.of(plan.getCvViewLimit(), 0))
                .aiFeatures(plan.isAiFeatures())
                .analyticsAccess(plan.isAnalyticsAccess())
                .currentPaymentId(paymentId)
                .startedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();
    }
}