package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.repository.CompanySubscriptionRepository;
import edu.tlu.jobplatform.subscription.domain.service.QuotaDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsumeQuotaUseCase {

    private final CompanySubscriptionRepository subscriptionRepo;
    private final QuotaDomainService quotaDomainService;

    @Transactional
    public void execute(UUID companyId) {
        CompanySubscription sub = subscriptionRepo
                .findActiveByCompanyId(companyId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Công ty chưa có gói dịch vụ. Vui lòng mua gói để đăng bài.",
                        "NO_ACTIVE_SUBSCRIPTION"));

        quotaDomainService.checkJobPostQuota(sub); // throw nếu hết quota
        quotaDomainService.consumeJobPost(sub);
        subscriptionRepo.save(sub);

        log.info("Quota consumed: companyId={} remaining={}",
                companyId, sub.getJobPostQuota().remaining());
    }
}