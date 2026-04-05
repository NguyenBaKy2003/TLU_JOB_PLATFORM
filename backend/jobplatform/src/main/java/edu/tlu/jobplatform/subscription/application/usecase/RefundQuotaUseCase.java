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

    @Transactional
    public void execute(UUID companyId) {
        subscriptionRepo.findActiveByCompanyId(companyId).ifPresent(sub -> {
            sub.refundJobPost(1);
            subscriptionRepo.save(sub);
            log.info("Quota refunded: companyId={} remaining={}",
                    companyId, sub.getJobPostQuota().remaining());
        });
    }
}