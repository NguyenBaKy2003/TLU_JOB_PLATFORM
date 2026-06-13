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
    public boolean hasFeaturedQuota(UUID companyId) {
        return checkQuotaUseCase.execute(companyId).canPostFeatured(); // ← sửa từ canPostFeaturedJob()
    }

    @Override
    public boolean hasAllQuota(UUID companyId, boolean includeFeatured) {
        CheckQuotaUseCase.Result result = checkQuotaUseCase.execute(companyId);
        if (!result.canPostJob())
            return false;
        if (includeFeatured && !result.canPostFeatured())
            return false;
        return true;
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
        refundQuotaUseCase.execute(companyId, RefundQuotaUseCase.QuotaType.JOB_POST);
    }

    @Override
    public void refundFeaturedQuota(UUID companyId) {
        refundQuotaUseCase.execute(companyId, RefundQuotaUseCase.QuotaType.FEATURED_JOB);
    }
}