package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckCandidateQuotaUseCase {

    private final CandidateSubscriptionRepository subscriptionRepository;

    @Transactional(readOnly = true)
    public Result execute(UUID candidateId) {
        CandidateSubscription sub = subscriptionRepository
                .findActiveByCandidate(candidateId)
                .orElse(null);

        if (sub == null || !sub.isActive()) {
            return Result.noSubscription();
        }

        return new Result(
                true,
                sub.getPlanCode(),
                sub.canApply(),
                sub.canBoostCv(),
                sub.isAiCvWriter(),
                sub.isPremiumTemplateAccess(),
                sub.getApplicationQuota().remaining(),
                sub.getCvBoostQuota().remaining(),
                sub.getCvCreateQuota().getLimit(),
                sub.daysRemaining());
    }

    public record Result(
            boolean hasActiveSubscription,
            String planCode,
            boolean canApply,
            boolean canBoostCv,
            boolean aiCvWriter,
            boolean premiumTemplateAccess,
            int applicationsRemaining,
            int cvBoostsRemaining,
            int cvCreateLimit,
            long daysLeft) {
        static Result noSubscription() {
            return new Result(
                    false, null,
                    false, false,
                    false, false,
                    0, 0, 1, 0L); // cvCreateLimit=1 cho phép tạo 1 CV miễn phí
        }
    }
}