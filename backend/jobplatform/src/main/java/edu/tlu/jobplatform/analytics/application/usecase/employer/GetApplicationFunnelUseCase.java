package edu.tlu.jobplatform.analytics.application.usecase.employer;

import edu.tlu.jobplatform.analytics.domain.model.ApplicationFunnelStats;
import edu.tlu.jobplatform.analytics.infrastructure.query.EmployerAnalyticsQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * UseCase: Lấy phễu ứng tuyển.
 *
 * - jobPostId = null → phễu tổng hợp toàn công ty
 * - jobPostId != null → phễu của một job cụ thể
 */
@Service
@RequiredArgsConstructor
public class GetApplicationFunnelUseCase {

    private final EmployerAnalyticsQueryService queryService;

    public ApplicationFunnelStats execute(Command cmd) {
        return queryService.getApplicationFunnel(cmd.companyId(), cmd.jobPostId());
    }

    public record Command(UUID companyId, UUID jobPostId) {

        public static Command forCompany(UUID companyId) {
            return new Command(companyId, null);
        }

        public static Command forJob(UUID companyId, UUID jobPostId) {
            return new Command(companyId, jobPostId);
        }
    }
}