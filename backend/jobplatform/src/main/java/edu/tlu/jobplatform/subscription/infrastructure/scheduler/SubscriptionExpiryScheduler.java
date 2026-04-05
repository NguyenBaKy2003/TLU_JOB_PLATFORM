package edu.tlu.jobplatform.subscription.infrastructure.scheduler;

import edu.tlu.jobplatform.shared.event.subscription.SubscriptionExpiredEvent;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionStatus;
import edu.tlu.jobplatform.subscription.domain.repository.CompanySubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionExpiryScheduler {

    private final CompanySubscriptionRepository subscriptionRepo;
    private final ApplicationEventPublisher eventPublisher;

    /** Expire subscription hết hạn — chạy 00:05 AM hàng ngày */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void expireSubscriptions() {
        List<CompanySubscription> expired = subscriptionRepo
                .findByStatusAndExpiresAtBefore(SubscriptionStatus.ACTIVE, LocalDateTime.now());

        if (expired.isEmpty())
            return;
        log.info("Expiring {} subscriptions...", expired.size());

        expired.forEach(sub -> {
            sub.expire();
            subscriptionRepo.save(sub);
            eventPublisher.publishEvent(
                    new SubscriptionExpiredEvent(
                            sub.getCompanyId(),
                            sub.getPlanId(),
                            sub.getPlanCode()));
            log.info("Subscription expired: companyId={} plan={}", sub.getCompanyId(), sub.getPlanCode());
        });
    }
}
