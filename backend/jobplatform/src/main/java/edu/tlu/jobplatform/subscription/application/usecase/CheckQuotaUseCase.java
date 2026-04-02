package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.repository.CompanySubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * CheckQuotaUseCase — Kiểm tra công ty còn quota không.
 * Dùng bởi Job domain trước khi cho phép đăng tin.
 * ReadOnly transaction — không thay đổi dữ liệu.
 */
@Service
@RequiredArgsConstructor
public class CheckQuotaUseCase {

    private final CompanySubscriptionRepository subscriptionRepository;

    @Transactional(readOnly = true)
    public Result execute(UUID companyId) {
        CompanySubscription sub = subscriptionRepository
                .findActiveByCompanyId(companyId)
                .orElse(null);

        boolean hasActive = sub != null && sub.isActive();
        boolean canPostJob = hasActive && sub.canPostJob();
        boolean canPostFeatured = hasActive && sub.canPostFeatured();
        int jobsRemaining = hasActive ? sub.getJobPostQuota().remaining() : 0;
        long daysLeft = hasActive ? sub.daysRemaining() : 0;
        String planCode = hasActive ? sub.getPlanCode() : null;

        return new Result(hasActive, canPostJob, canPostFeatured,
                jobsRemaining, daysLeft, planCode);
    }

    public record Result(
            boolean hasActiveSubscription,
            boolean canPostJob,
            boolean canPostFeatured,
            int jobsRemaining,
            long daysLeft,
            String planCode) {
    }
}