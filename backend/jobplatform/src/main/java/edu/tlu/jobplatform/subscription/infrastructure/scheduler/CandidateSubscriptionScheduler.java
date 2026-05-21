package edu.tlu.jobplatform.subscription.infrastructure.scheduler;

import edu.tlu.jobplatform.shared.event.subscription.CandidateSubscriptionExpiredEvent;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionStatus;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler xử lý vòng đời CandidateSubscription.
 *
 * Hai nhiệm vụ tách biệt:
 *
 * 1. expireSubscriptions() — 00:05 AM hàng ngày
 * Tương tự SubscriptionExpiryScheduler của Company.
 * Expire các subscription hết hạn, publish event gửi email thông báo.
 *
 * 2. resetMonthlyQuotas() — 00:10 AM ngày 1 hàng tháng
 * Reset applicationQuota và cvBoostQuota về 0 cho tất cả ACTIVE subscription.
 * mockInterviewQuota KHÔNG reset — one-time per period.
 * Dùng lastQuotaResetAt để idempotency: chỉ reset nếu đã qua > 28 ngày từ lần
 * trước.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CandidateSubscriptionScheduler {

    private final CandidateSubscriptionRepository subscriptionRepo;
    private final ApplicationEventPublisher eventPublisher;

    /** Expire candidate subscription hết hạn — 00:05 AM hàng ngày */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void expireSubscriptions() {
        List<CandidateSubscription> expired = subscriptionRepo
                .findByStatusAndExpiresAtBefore(
                        CandidateSubscriptionStatus.ACTIVE, LocalDateTime.now());

        if (expired.isEmpty())
            return;
        log.info("[CandidateScheduler] Expiring {} subscriptions...", expired.size());

        expired.forEach(sub -> {
            sub.expire();
            subscriptionRepo.save(sub);
            eventPublisher.publishEvent(
                    new CandidateSubscriptionExpiredEvent(
                            sub.getCandidateId(),
                            sub.getPlanCode()));
            log.info("[CandidateScheduler] Expired: candidateId={} plan={}",
                    sub.getCandidateId(), sub.getPlanCode());
        });
    }

    /**
     * Reset quota hàng tháng — 00:10 AM ngày 1 hàng tháng.
     *
     * Dùng threshold = now() - 28 ngày thay vì cố định ngày 1
     * để tránh trường hợp scheduler bị skip (server down, restart).
     * Nếu lastQuotaResetAt < threshold → cần reset.
     */
    @Scheduled(cron = "0 10 0 1 * *")
    @Transactional
    public void resetMonthlyQuotas() {
        // 28 ngày để an toàn, tránh reset thiếu với tháng ngắn
        LocalDateTime threshold = LocalDateTime.now().minusDays(28);

        List<CandidateSubscription> toReset = subscriptionRepo.findActiveForQuotaReset(threshold);

        if (toReset.isEmpty()) {
            log.info("[CandidateScheduler] No subscriptions need quota reset.");
            return;
        }
        log.info("[CandidateScheduler] Resetting monthly quota for {} subscriptions...", toReset.size());

        toReset.forEach(sub -> {
            sub.resetMonthlyQuotas();
            subscriptionRepo.save(sub);
            log.info("[CandidateScheduler] Quota reset: candidateId={} plan={}",
                    sub.getCandidateId(), sub.getPlanCode());
        });
    }
}