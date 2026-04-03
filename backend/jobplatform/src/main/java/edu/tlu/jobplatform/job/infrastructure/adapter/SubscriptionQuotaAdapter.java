package edu.tlu.jobplatform.job.infrastructure.adapter;

import edu.tlu.jobplatform.job.application.port.out.QuotaServicePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Adapter kết nối Job domain với Subscription domain.
 *
 * Job domain không import gì từ subscription package.
 * Adapter này là "cầu nối" duy nhất.
 *
 * Sprint 3: Inject SubscriptionService thật vào đây.
 * Hiện tại: mock — luôn có quota (để dev/test không bị block).
 */
@Slf4j
@Component
public class SubscriptionQuotaAdapter implements QuotaServicePort {

    // TODO Sprint 3: @Autowired CheckQuotaUseCase checkQuotaUseCase;
    // TODO Sprint 3: @Autowired ConsumeQuotaUseCase consumeQuotaUseCase;

    @Override
    public boolean hasQuota(UUID companyId) {
        log.debug("QuotaCheck (mock): companyId={} → true", companyId);
        // TODO Sprint 3: return checkQuotaUseCase.execute(companyId);
        return true; // Dev mode: luôn có quota
    }

    @Override
    public void consumeQuota(UUID companyId) {
        log.info("QuotaConsume (mock): companyId={}", companyId);
        // TODO Sprint 3: consumeQuotaUseCase.execute(companyId);
        // Nếu hết quota: throw new QuotaExceededException(...)
    }

    @Override
    public void refundQuota(UUID companyId) {
        log.info("QuotaRefund (mock): companyId={}", companyId);
        // TODO Sprint 3: refundQuotaUseCase.execute(companyId);
    }
}