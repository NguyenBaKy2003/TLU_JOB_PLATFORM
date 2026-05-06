package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Value object: phễu ứng tuyển của một job hoặc toàn bộ company.
 */
@Getter
@Builder
public class ApplicationFunnelStats {

    private final UUID companyId;
    private final UUID jobPostId; // null = tổng hợp toàn company

    private final long submitted;
    private final long screening;
    private final long interviewing;
    private final long offered;
    private final long hired;
    private final long rejected;
    private final long withdrawn;

    /** Tỉ lệ chuyển đổi cuối cùng (hired / submitted) */
    public double getOverallConversionRate() {
        if (submitted == 0)
            return 0.0;
        return (double) hired / submitted * 100;
    }

    /** Tỉ lệ qua vòng screening */
    public double getScreeningPassRate() {
        if (submitted == 0)
            return 0.0;
        return (double) screening / submitted * 100;
    }
}