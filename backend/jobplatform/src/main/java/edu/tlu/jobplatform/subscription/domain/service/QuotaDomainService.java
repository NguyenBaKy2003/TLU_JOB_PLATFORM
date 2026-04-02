package edu.tlu.jobplatform.subscription.domain.service;

import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.QuotaExceededException;
import org.springframework.stereotype.Service;

/**
 * Domain Service: Kiểm tra và tiêu thụ quota.
 *
 * Tại sao cần domain service?
 * Logic quota liên quan đến nhiều rules phức tạp,
 * cần tái sử dụng ở nhiều UseCase (CreateJob, PublishJob, ViewCV...).
 */
@Service
public class QuotaDomainService {

    /**
     * Kiểm tra công ty có quyền đăng tin không.
     * Throw QuotaExceededException nếu hết quota.
     */
    public void checkJobPostQuota(CompanySubscription sub) {
        if (sub == null || !sub.isActive()) {
            throw new BusinessRuleException(
                    "Bạn cần mua gói dịch vụ để đăng tin tuyển dụng.",
                    "NO_ACTIVE_SUBSCRIPTION");
        }
        if (sub.getJobPostQuota().isExceeded()) {
            throw new QuotaExceededException(
                    "Bạn đã sử dụng hết " + sub.getJobPostQuota().getLimit() +
                            " tin tuyển dụng trong gói " + sub.getPlanCode() + ".",
                    "JOB_POST_QUOTA_EXCEEDED");
        }
    }

    /**
     * Kiểm tra quota tin nổi bật.
     */
    public void checkFeaturedJobQuota(CompanySubscription sub) {
        if (sub == null || !sub.isActive()) {
            throw new BusinessRuleException(
                    "Bạn cần mua gói dịch vụ để đăng tin nổi bật.",
                    "NO_ACTIVE_SUBSCRIPTION");
        }
        if (sub.getFeaturedJobQuota().isExceeded()) {
            throw new QuotaExceededException(
                    "Bạn đã dùng hết tin nổi bật trong gói " + sub.getPlanCode() + ".",
                    "FEATURED_JOB_QUOTA_EXCEEDED");
        }
    }

    /**
     * Tiêu thụ 1 lượt đăng tin.
     * Gọi sau khi đã check quota và tin được publish.
     */
    public void consumeJobPost(CompanySubscription sub) {
        sub.consumeJobPost(1);
    }

    /**
     * Tiêu thụ 1 lượt xem CV.
     */
    public void consumeCvView(CompanySubscription sub) {
        if (sub != null && sub.isActive() && !sub.getJobPostQuota().isUnlimited()) {
            sub.consumeCvView(1);
        }
    }
}