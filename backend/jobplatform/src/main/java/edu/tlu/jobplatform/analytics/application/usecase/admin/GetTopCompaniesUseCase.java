package edu.tlu.jobplatform.analytics.application.usecase.admin;

import edu.tlu.jobplatform.analytics.domain.model.TopCompanyStats;
import edu.tlu.jobplatform.analytics.infrastructure.query.AnalyticsQueryService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * UseCase: Lấy bảng xếp hạng công ty theo revenue + applications.
 */
@Service
@RequiredArgsConstructor
public class GetTopCompaniesUseCase {

    private static final int MAX_LIMIT = 50;
    private final AnalyticsQueryService queryService;

    public List<TopCompanyStats> execute(Command cmd) {
        if (cmd.limit() < 1 || cmd.limit() > MAX_LIMIT)
            throw new BusinessRuleException(
                    "Limit phải từ 1 đến " + MAX_LIMIT, "INVALID_LIMIT");

        return queryService.getTopCompanies(cmd.limit());
    }

    public record Command(int limit) {
        public Command {
            if (limit <= 0)
                limit = 10;
        }
    }
}