package edu.tlu.jobplatform.job.application.port.out;

import java.util.UUID;

public interface QuotaServicePort {

    boolean hasQuota(UUID companyId);

    void consumeQuota(UUID companyId);

    /** Trừ 1 quota đăng tin nổi bật */
    void consumeFeaturedQuota(UUID companyId);

    default void refundQuota(UUID companyId) {
    }
}