package edu.tlu.jobplatform.job.application.port.out;

import java.util.UUID;

/**
 * Output Port: Kiểm tra và tiêu thụ quota từ Subscription domain.
 *
 * Job domain KHÔNG phụ thuộc trực tiếp vào Subscription domain.
 * Dependency Inversion: UseCase gọi interface này,
 * infrastructure adapter sẽ thực sự gọi SubscriptionService.
 */
public interface QuotaServicePort {

    /**
     * Kiểm tra công ty còn quota đăng tin không.
     * Throw QuotaExceededException nếu hết quota.
     *
     * @param companyId ID công ty
     */
    void checkJobPostQuota(UUID companyId);

    /**
     * Kiểm tra công ty còn quota tin nổi bật không.
     * Throw QuotaExceededException nếu hết quota.
     */
    void checkFeaturedJobQuota(UUID companyId);

    /**
     * Tiêu thụ 1 lượt đăng tin.
     * Gọi SAU KHI tin đã được publish thành công.
     */
    void consumeJobPostQuota(UUID companyId);

    /**
     * Tiêu thụ 1 lượt tin nổi bật.
     * Gọi SAU KHI tin được đánh dấu featured.
     */
    void consumeFeaturedJobQuota(UUID companyId);

    /**
     * Kiểm tra nhanh: công ty có subscription active không.
     * Dùng để hiển thị UI hint (không throw exception).
     */
    boolean hasActiveSubscription(UUID companyId);
}