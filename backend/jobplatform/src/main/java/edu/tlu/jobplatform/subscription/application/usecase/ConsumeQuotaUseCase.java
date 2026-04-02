package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.repository.CompanySubscriptionRepository;
import edu.tlu.jobplatform.subscription.domain.service.QuotaDomainService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsumeQuotaUseCase {

    private final CompanySubscriptionRepository subscriptionRepository;
    private final QuotaDomainService quotaService;

    @Transactional
    public void execute(UUID companyId, QuotaType type) {

        CompanySubscription sub = subscriptionRepository
                .findActiveByCompanyId(companyId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Không có gói dịch vụ active.", "NO_ACTIVE_SUBSCRIPTION"));

        switch (type) {
            case JOB_POST -> {
                quotaService.checkJobPostQuota(sub);
                quotaService.consumeJobPost(sub);
            }
            case FEATURED_JOB -> {
                quotaService.checkFeaturedJobQuota(sub);
                sub.consumeFeaturedJob(1);
            }
            case CV_VIEW -> quotaService.consumeCvView(sub);
        }

        subscriptionRepository.save(sub);
        log.debug("Quota consumed: company={} type={}", companyId, type);
    }

    public enum QuotaType {
        JOB_POST, FEATURED_JOB, CV_VIEW
    }
}