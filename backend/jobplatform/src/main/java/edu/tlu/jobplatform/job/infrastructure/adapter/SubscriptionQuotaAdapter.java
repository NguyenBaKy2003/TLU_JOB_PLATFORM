package edu.tlu.jobplatform.job.infrastructure.adapter;

import edu.tlu.jobplatform.job.application.port.out.QuotaServicePort;
import edu.tlu.jobplatform.subscription.application.usecase.CheckQuotaUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.ConsumeQuotaUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.RefundQuotaUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionQuotaAdapter implements QuotaServicePort {

    private final CheckQuotaUseCase checkQuotaUseCase;
    private final ConsumeQuotaUseCase consumeQuotaUseCase;
    private final RefundQuotaUseCase refundQuotaUseCase;

    @Override
    public boolean hasQuota(UUID companyId) {
        return checkQuotaUseCase.execute(companyId).canPostJob();
    }

    @Override
    public void consumeQuota(UUID companyId) {
        consumeQuotaUseCase.execute(companyId, ConsumeQuotaUseCase.QuotaType.JOB_POST);
    }

    @Override
    public void consumeFeaturedQuota(UUID companyId) {
        consumeQuotaUseCase.execute(companyId, ConsumeQuotaUseCase.QuotaType.FEATURED_JOB);
    }

    @Override
    public void refundQuota(UUID companyId) {
        refundQuotaUseCase.execute(companyId);
    }
}