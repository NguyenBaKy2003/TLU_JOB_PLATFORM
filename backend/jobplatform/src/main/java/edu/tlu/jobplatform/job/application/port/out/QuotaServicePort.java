package edu.tlu.jobplatform.job.application.port.out;

import java.util.UUID;

public interface QuotaServicePort {

    boolean hasQuota(UUID companyId);

    boolean hasFeaturedQuota(UUID companyId);

    /**
     * Check cả hai trong 1 lần gọi, tránh 2 round-trip DB.
     * Default dùng hasQuota + hasFeaturedQuota — adapter override để tối ưu.
     */
    default boolean hasAllQuota(UUID companyId, boolean includeFeatured) {
        return hasQuota(companyId) && (!includeFeatured || hasFeaturedQuota(companyId));
    }

    void consumeQuota(UUID companyId);

    void consumeFeaturedQuota(UUID companyId);

    default void refundQuota(UUID companyId) {
    }

    default void refundFeaturedQuota(UUID companyId) {
    }
}