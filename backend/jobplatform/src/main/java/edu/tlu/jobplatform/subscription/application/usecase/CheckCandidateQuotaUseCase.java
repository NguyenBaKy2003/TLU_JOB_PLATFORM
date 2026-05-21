package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Kiểm tra quota còn lại của Candidate.
 * Candidate dùng để biết còn bao nhiêu lượt ứng tuyển, boost CV, v.v.
 * Cũng dùng nội bộ bởi các UseCase khác (JobApplicationUseCase,
 * CvBoostUseCase).
 */
@Service
@RequiredArgsConstructor
public class CheckCandidateQuotaUseCase {

    private final CandidateSubscriptionRepository subscriptionRepository;

    @Transactional(readOnly = true)
    public Result execute(UUID candidateId) {
        CandidateSubscription sub = subscriptionRepository
                .findActiveByCandidate(candidateId)
                .orElse(null);

        boolean hasActive = sub != null && sub.isActive();

        if (!hasActive) {
            return Result.noSubscription();
        }

        return new Result(
                true,
                sub.getPlanCode(),
                sub.canApply(),
                sub.canBoostCv(),
                sub.canAddJobAlert(),
                sub.canRunMockInterview(),
                sub.isAiCvWriter(),
                sub.isSalaryInsights(),
                sub.isProfileAnalytics(),
                sub.isAdvancedFilters(),
                sub.getApplicationQuota().remaining(),
                sub.getCvBoostQuota().remaining(),
                sub.getJobAlertQuota().remaining(),
                sub.getMockInterviewQuota().remaining(),
                sub.daysRemaining());
    }

    public record Result(
            boolean hasActiveSubscription,
            String planCode,
            boolean canApply,
            boolean canBoostCv,
            boolean canAddJobAlert,
            boolean canRunMockInterview,
            boolean aiCvWriter,
            boolean salaryInsights,
            boolean profileAnalytics,
            boolean advancedFilters,
            int applicationsRemaining,
            int cvBoostsRemaining,
            int jobAlertsRemaining,
            int mockInterviewsRemaining,
            long daysLeft) {
        /** Factory method cho trường hợp không có subscription */
        static Result noSubscription() {
            return new Result(
                    false, null,
                    false, false, false, false,
                    false, false, false, false,
                    0, 0, 0, 0, 0L);
        }
    }
}