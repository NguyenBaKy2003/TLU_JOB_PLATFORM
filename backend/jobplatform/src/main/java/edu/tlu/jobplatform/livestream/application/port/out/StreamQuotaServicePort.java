package edu.tlu.jobplatform.livestream.application.port.out;

import java.util.UUID;

/**
 * Giao tiếp với subscription domain để kiểm tra + tiêu thụ quota stream.
 */
public interface StreamQuotaServicePort {
    boolean hasStreamQuota(UUID companyId);

    void consumeStreamQuota(UUID companyId);

    int getMaxViewersForCompany(UUID companyId);

    boolean isAiSummaryEnabled(UUID companyId);
}