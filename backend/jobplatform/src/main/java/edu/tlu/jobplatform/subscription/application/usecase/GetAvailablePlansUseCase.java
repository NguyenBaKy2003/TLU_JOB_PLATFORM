package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Lấy danh sách gói dịch vụ đang active.
 * Public endpoint — không cần auth.
 */
@Service
@RequiredArgsConstructor
public class GetAvailablePlansUseCase {

    private final SubscriptionPlanRepository planRepo;

    public List<SubscriptionPlan> execute() {
        return planRepo.findAllActive();
    }
}
