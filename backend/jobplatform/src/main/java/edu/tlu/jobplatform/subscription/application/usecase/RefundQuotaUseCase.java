package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.repository.CompanySubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefundQuotaUseCase {

    private final CompanySubscriptionRepository subscriptionRepo;

    public enum QuotaType {
        JOB_POST, FEATURED_JOB
    }

    @Transactional
    public void execute(UUID companyId, QuotaType type) {
        subscriptionRepo.findActiveByCompanyId(companyId).ifPresent(sub -> {
            switch (type) {
                case JOB_POST -> {
                    sub.refundJobPost(1);
                    log.info("JobPost quota refunded: companyId={} remaining={}",
                            companyId, sub.getJobPostQuota().remaining());
                }
                case FEATURED_JOB -> {
                    sub.refundFeaturedJob(1);
                    log.info("FeaturedJob quota refunded: companyId={} remaining={}",
                            companyId, sub.getFeaturedJobQuota().remaining());
                }
            }
            subscriptionRepo.save(sub);
        });
    }
}