package edu.tlu.jobplatform.livestream.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.livestream.application.port.out.StreamQuotaServicePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Stub adapter — dùng cho local dev / khi subscription domain chưa sẵn sàng.
 * Production: thay bằng implementation gọi thật vào SubscriptionService.
 */
@Component
@Slf4j
public class StubStreamQuotaAdapter implements StreamQuotaServicePort {

    @Override
    public boolean hasStreamQuota(UUID companyId) {
        log.debug("[QuotaStub] hasStreamQuota — companyId={} → true (stub)", companyId);
        return true; // local dev: luôn cho phép
    }

    @Override
    public void consumeStreamQuota(UUID companyId) {
        log.debug("[QuotaStub] consumeStreamQuota — companyId={} (no-op stub)", companyId);
        // no-op
    }

    @Override
    public int getMaxViewersForCompany(UUID companyId) {
        log.debug("[QuotaStub] getMaxViewersForCompany — companyId={} → 500 (stub)", companyId);
        return 500;
    }

    @Override
    public boolean isAiSummaryEnabled(UUID companyId) {
        log.debug("[QuotaStub] isAiSummaryEnabled — companyId={} → false (stub)", companyId);
        return false;
    }
}