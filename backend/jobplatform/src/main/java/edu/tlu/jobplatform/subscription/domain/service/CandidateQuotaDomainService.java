package edu.tlu.jobplatform.subscription.domain.service;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import org.springframework.stereotype.Service;

/**
 * Domain Service: Kiểm tra và tiêu thụ quota cho Candidate.
 *
 * Tương tự QuotaDomainService (Company) nhưng dành riêng cho
 * các loại quota của ứng viên.
 *
 * Pattern: check → consume (mutate aggregate) → caller save aggregate.
 * Domain service KHÔNG gọi repository — đó là trách nhiệm của UseCase.
 */
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

    public void checkJobAlertQuota(CandidateSubscription sub) {
        requireActive(sub, "tạo job alert");
        if (!sub.canAddJobAlert())
            throw new BusinessRuleException(
                    "Bạn đã đạt giới hạn " + sub.getJobAlertQuota().getLimit()
                            + " job alert. Xoá bớt hoặc nâng cấp gói.",
                    "JOB_ALERT_QUOTA_EXCEEDED");
    }

    public void checkMockInterviewQuota(CandidateSubscription sub) {
        requireActive(sub, "luyện phỏng vấn AI");
        if (!sub.canRunMockInterview())
            throw new BusinessRuleException(
                    "Bạn đã sử dụng hết " + sub.getMockInterviewQuota().getLimit()
                            + " buổi mock interview trong kỳ này.",
                    "MOCK_INTERVIEW_QUOTA_EXCEEDED");
    }

    public void checkAiCvWriter(CandidateSubscription sub) {
        requireActive(sub, "viết CV bằng AI");
        if (!sub.isAiCvWriter())
            throw new BusinessRuleException(
                    "Tính năng AI viết CV chỉ có trong gói PREMIUM. Vui lòng nâng cấp.",
                    "AI_CV_WRITER_NOT_AVAILABLE");
    }

    public void checkSalaryInsights(CandidateSubscription sub) {
        requireActive(sub, "tra cứu mức lương");
        if (!sub.isSalaryInsights())
            throw new BusinessRuleException(
                    "Tính năng tra cứu mức lương chỉ có trong gói PREMIUM.",
                    "SALARY_INSIGHTS_NOT_AVAILABLE");
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

    public void consumeJobAlert(CandidateSubscription sub) {
        checkJobAlertQuota(sub);
        sub.consumeJobAlert();
    }

    public void consumeMockInterview(CandidateSubscription sub) {
        checkMockInterviewQuota(sub);
        sub.consumeMockInterview();
    }

    // ── Private ───────────────────────────────────────────────────────

    private void requireActive(CandidateSubscription sub, String action) {
        if (sub == null || !sub.isActive())
            throw new BusinessRuleException(
                    "Bạn chưa có gói dịch vụ active. Vui lòng mua gói để " + action + ".",
                    "NO_ACTIVE_CANDIDATE_SUBSCRIPTION");
    }
}