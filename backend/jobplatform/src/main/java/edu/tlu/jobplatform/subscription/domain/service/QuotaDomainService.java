package edu.tlu.jobplatform.subscription.domain.service;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.QuotaExceededException;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import org.springframework.stereotype.Service;

@Service
public class QuotaDomainService {

    public void checkJobPostQuota(CompanySubscription sub) {
        if (sub == null || !sub.isActive())
            throw new BusinessRuleException(
                    "Bạn cần mua gói dịch vụ để đăng tin tuyển dụng.",
                    "NO_ACTIVE_SUBSCRIPTION");

        if (sub.getJobPostQuota().isExceeded())
            throw new QuotaExceededException(
                    "Bạn đã sử dụng hết " + sub.getJobPostQuota().getLimit() +
                            " tin tuyển dụng trong gói " + sub.getPlanCode() + ".",
                    "JOB_POST_QUOTA_EXCEEDED");
    }

    public void checkFeaturedJobQuota(CompanySubscription sub) {
        if (sub == null || !sub.isActive())
            throw new BusinessRuleException(
                    "Bạn cần mua gói dịch vụ để đăng tin nổi bật.",
                    "NO_ACTIVE_SUBSCRIPTION");

        if (sub.getFeaturedJobQuota().isExceeded())
            throw new QuotaExceededException(
                    "Bạn đã dùng hết tin nổi bật trong gói " + sub.getPlanCode() + ".",
                    "FEATURED_JOB_QUOTA_EXCEEDED");
    }

    public void consumeJobPost(CompanySubscription sub) {
        sub.consumeJobPost(1);
    }

    public void consumeCvView(CompanySubscription sub) {
        if (sub != null && sub.isActive() && !sub.getCvViewQuota().isUnlimited())
            sub.consumeCvView(1);
    }
}
