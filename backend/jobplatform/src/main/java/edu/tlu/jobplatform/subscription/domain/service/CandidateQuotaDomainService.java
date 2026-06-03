package edu.tlu.jobplatform.subscription.domain.service;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import org.springframework.stereotype.Service;

@Service
public class CandidateQuotaDomainService {

    // ── Validation only ───────────────────────────────────────────────

    public void checkApplicationQuota(CandidateSubscription sub) {
        requireActive(sub, "ứng tuyển");
        if (!sub.canApply())
            throw new BusinessRuleException(
                    "Bạn đã sử dụng hết " + sub.getApplicationQuota().getLimit()
                            + " lượt ứng tuyển trong tháng này. Nâng cấp gói để tiếp tục.",
                    "APPLICATION_QUOTA_EXCEEDED");
    }

    public void checkCvBoostQuota(CandidateSubscription sub) {
        requireActive(sub, "boost CV");
        if (!sub.canBoostCv())
            throw new BusinessRuleException(
                    "Bạn đã dùng hết lượt boost CV trong tháng này.",
                    "CV_BOOST_QUOTA_EXCEEDED");
    }

    public void checkAiCvWriter(CandidateSubscription sub) {
        requireActive(sub, "viết CV bằng AI");
        if (!sub.isAiCvWriter())
            throw new BusinessRuleException(
                    "Tính năng AI viết CV chỉ có trong gói PREMIUM. Vui lòng nâng cấp.",
                    "AI_CV_WRITER_NOT_AVAILABLE");
    }

    public void checkPremiumTemplate(CandidateSubscription sub) {
        requireActive(sub, "dùng template premium");
        if (!sub.isPremiumTemplateAccess())
            throw new BusinessRuleException(
                    "Template này chỉ dành cho gói PRO trở lên.",
                    "PREMIUM_TEMPLATE_NOT_AVAILABLE");
    }

    // ── Consume (validate + mutate) ───────────────────────────────────

    public void consumeApplication(CandidateSubscription sub) {
        checkApplicationQuota(sub);
        sub.consumeApplication();
    }

    public void consumeCvBoost(CandidateSubscription sub) {
        checkCvBoostQuota(sub);
        sub.consumeCvBoost();
    }

    // ── Private ──────

    private void requireActive(CandidateSubscription sub, String action) {
        if (sub == null || !sub.isActive())
            throw new BusinessRuleException(
                    "Bạn chưa có gói dịch vụ active. Vui lòng mua gói để " + action + ".",
                    "NO_ACTIVE_CANDIDATE_SUBSCRIPTION");
    }
}