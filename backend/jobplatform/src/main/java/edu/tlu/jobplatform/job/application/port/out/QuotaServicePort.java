package edu.tlu.jobplatform.job.application.port.out;

import java.util.UUID;

/**
 * Output Port để kiểm tra và tiêu thụ quota đăng tin.
 *
 * Job domain KHÔNG import subscription domain trực tiếp.
 * Adapter SubscriptionQuotaAdapter implements interface này
 * bằng cách gọi vào Subscription domain.
 *
 * Clean Architecture: domain A không phụ thuộc domain B.
 */
public interface QuotaServicePort {

    /**
     * Kiểm tra công ty còn quota để đăng tin không.
     * Không trừ quota.
     */
    boolean hasQuota(UUID companyId);

    /**
     * Trừ 1 quota đăng tin của công ty.
     * Gọi ngay trước khi publish bài.
     * Throw QuotaExceededException nếu hết quota.
     */
    void consumeQuota(UUID companyId);

    /**
     * Hoàn lại quota khi bài đăng bị xóa trước khi hết hạn.
     * Tuỳ chính sách business — có thể không implement.
     */
    default void refundQuota(UUID companyId) {
        // Default: không hoàn quota
    }
}