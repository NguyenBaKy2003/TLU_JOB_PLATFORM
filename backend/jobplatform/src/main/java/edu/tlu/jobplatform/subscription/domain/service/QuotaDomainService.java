package edu.tlu.jobplatform.subscription.domain.service;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import org.springframework.stereotype.Service;

@Service
public class QuotaDomainService {

    // ── Validation only ───────────────────────────────────────

    public void checkJobPostQuota(CompanySubscription sub) {
        requireActive(sub, "đăng tin tuyển dụng");
        if (!sub.canPostJob())
            throw new BusinessRuleException(
                    "Bạn đã sử dụng hết " + sub.getJobPostQuota().getLimit() +
                            " tin tuyển dụng trong gói " + sub.getPlanCode() + ".",
                    "JOB_POST_QUOTA_EXCEEDED");
    }

    public void checkFeaturedJobQuota(CompanySubscription sub) {
        requireActive(sub, "đăng tin nổi bật");
        if (!sub.canPostFeatured())
            throw new BusinessRuleException(
                    "Bạn đã dùng hết tin nổi bật trong gói " + sub.getPlanCode() + ".",
                    "FEATURED_JOB_QUOTA_EXCEEDED");
    }

    public void checkCvViewQuota(CompanySubscription sub) {
        requireActive(sub, "xem CV");
        if (!sub.canViewCv())
            throw new BusinessRuleException(
                    "Bạn đã dùng hết lượt xem CV trong gói " + sub.getPlanCode() + ".",
                    "CV_VIEW_QUOTA_EXCEEDED");
    }

    // ── Consume (validate + mutate) ───────────────────────────

    public void consumeJobPost(CompanySubscription sub) {
        checkJobPostQuota(sub);
        sub.consumeJobPost(1);
    }

    public void consumeFeaturedJob(CompanySubscription sub) {
        checkFeaturedJobQuota(sub);
        sub.consumeFeaturedJob(1);
    }

    public void consumeCvView(CompanySubscription sub) {
        checkCvViewQuota(sub);
        sub.consumeCvView(1);
    }

    // ── Private ───

    private void requireActive(CompanySubscription sub, String action) {
        if (sub == null || !sub.isActive())
            throw new BusinessRuleException(
                    "Công ty chưa có gói dịch vụ. Vui lòng mua gói để " + action + ".",
                    "NO_ACTIVE_SUBSCRIPTION");
    }
}