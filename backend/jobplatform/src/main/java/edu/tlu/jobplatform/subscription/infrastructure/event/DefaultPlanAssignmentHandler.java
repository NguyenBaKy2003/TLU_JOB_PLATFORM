package edu.tlu.jobplatform.subscription.infrastructure.event;

import edu.tlu.jobplatform.shared.event.company.CompanyProfileCreatedEvent;
import edu.tlu.jobplatform.shared.event.user.UserRegisteredEvent;
import edu.tlu.jobplatform.subscription.application.usecase.AssignDefaultCandidatePlanUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.AssignDefaultCompanyPlanUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultPlanAssignmentHandler {

    private final AssignDefaultCompanyPlanUseCase assignCompanyPlan;
    private final AssignDefaultCandidatePlanUseCase assignCandidatePlan;

    /**
     * Trigger: Company tạo profile lần đầu.
     *
     * AFTER_COMMIT đảm bảo company đã persist trong DB
     * trước khi subscription được tạo (tránh FK violation).
     */
    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCompanyProfileCreated(CompanyProfileCreatedEvent event) {
        try {
            assignCompanyPlan.execute(event.companyId());
        } catch (Exception e) {
            // Không throw — lỗi plan không được block luồng tạo company
            log.error("Failed to assign FREE_COMPANY plan: companyId={} error={}",
                    event.companyId(), e.getMessage(), e);
        }
    }

    /**
     * Trigger: User đăng ký tài khoản với role CANDIDATE.
     *
     * Không xử lý EMPLOYER ở đây —
     * EMPLOYER được gán plan khi tạo CompanyProfile (onCompanyProfileCreated).
     */
    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserRegistered(UserRegisteredEvent event) {
        if (!"CANDIDATE".equalsIgnoreCase(event.role()))
            return;

        try {
            assignCandidatePlan.execute(event.userId());
        } catch (Exception e) {
            log.error("Failed to assign FREE_CANDIDATE plan: userId={} error={}",
                    event.userId(), e.getMessage(), e);
        }
    }
}