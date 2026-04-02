package edu.tlu.jobplatform.job.infrastructure.adapter;

import edu.tlu.jobplatform.job.application.port.out.QuotaServicePort;
import edu.tlu.jobplatform.subscription.application.usecase.CheckQuotaUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.ConsumeQuotaUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.ConsumeQuotaUseCase.QuotaType;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.QuotaExceededException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Adapter: Kết nối Job domain → Subscription domain.
 *
 * Job domain không import trực tiếp subscription classes.
 * Chỉ adapter này biết về Subscription UseCase.
 *
 * Trong monolith: gọi trực tiếp UseCase.
 * Trong microservice: thay bằng HTTP client / Feign.
 */
@Component
@RequiredArgsConstructor
public class SubscriptionQuotaAdapter implements QuotaServicePort {

    private final CheckQuotaUseCase checkQuotaUseCase;
    private final ConsumeQuotaUseCase consumeQuotaUseCase;

    @Override
    public boolean hasActiveSubscription(UUID companyId) {
        return checkQuotaUseCase.execute(companyId).hasActiveSubscription();
    }

    @Override
    public void checkJobPostQuota(UUID companyId) {
        CheckQuotaUseCase.Result result = checkQuotaUseCase.execute(companyId);

        if (!result.hasActiveSubscription())
            throw new BusinessRuleException(
                    "Bạn cần mua gói dịch vụ để đăng tin tuyển dụng.",
                    "NO_ACTIVE_SUBSCRIPTION");

        if (!result.canPostJob())
            throw new QuotaExceededException(
                    "Bạn đã sử dụng hết lượt đăng tin trong gói " + result.planCode() + ".",
                    "JOB_POST_QUOTA_EXCEEDED");
    }

    @Override
    public void checkFeaturedJobQuota(UUID companyId) {
        CheckQuotaUseCase.Result result = checkQuotaUseCase.execute(companyId);

        if (!result.hasActiveSubscription())
            throw new BusinessRuleException(
                    "Bạn cần mua gói dịch vụ để đăng tin nổi bật.",
                    "NO_ACTIVE_SUBSCRIPTION");

        if (!result.canPostFeatured())
            throw new QuotaExceededException(
                    "Bạn đã sử dụng hết lượt tin nổi bật trong gói " + result.planCode() + ".",
                    "FEATURED_JOB_QUOTA_EXCEEDED");
    }

    @Override
    public void consumeJobPostQuota(UUID companyId) {
        consumeQuotaUseCase.execute(companyId, QuotaType.JOB_POST);
    }

    @Override
    public void consumeFeaturedJobQuota(UUID companyId) {
        consumeQuotaUseCase.execute(companyId, QuotaType.FEATURED_JOB);
    }
}