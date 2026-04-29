package edu.tlu.jobplatform.livestream.infrastructure.subscription;

import edu.tlu.jobplatform.livestream.application.port.out.StreamQuotaServicePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * LOCAL PROFILE: Mock quota — luôn cho phép, không giới hạn.
 * Khi production: inject CheckQuotaUseCase + ConsumeQuotaUseCase từ
 * subscription domain.
 */
@Component
@Profile("local")
@RequiredArgsConstructor
@Slf4j
public class MockStreamQuotaAdapter implements StreamQuotaServicePort {

    @Override
    public boolean hasStreamQuota(UUID companyId) {
        log.debug("[Quota-Mock] hasStreamQuota companyId={} → true", companyId);
        return true;
    }

    @Override
    public void consumeStreamQuota(UUID companyId) {
        log.debug("[Quota-Mock] consumeStreamQuota companyId={} → no-op", companyId);
    }

    @Override
    public int getMaxViewersForCompany(UUID companyId) {
        return 200; // Local dev: 200 viewers
    }

    @Override
    public boolean isAiSummaryEnabled(UUID companyId) {
        return true; // Local dev: luôn bật
    }
}