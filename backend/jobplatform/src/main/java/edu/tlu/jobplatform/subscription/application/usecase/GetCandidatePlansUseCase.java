package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * UseCase: Lấy danh sách gói dịch vụ Candidate đang active.
 * Public endpoint — không cần auth.
 */
@Service
@RequiredArgsConstructor
public class GetCandidatePlansUseCase {

    private final CandidateSubscriptionPlanRepository planRepository;

    public List<CandidateSubscriptionPlan> execute() {
        return planRepository.findAllActive();
    }
}