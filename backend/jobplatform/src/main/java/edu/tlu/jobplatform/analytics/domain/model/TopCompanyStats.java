package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Value object: số liệu của một công ty trong bảng xếp hạng Admin.
 */
@Getter
@Builder
public class TopCompanyStats {

    private final UUID companyId;
    private final String companyName;
    private final String logoUrl;
    private final long totalJobs;
    private final long totalApplications;
    private final long totalHired;
    private final BigDecimal totalRevenue;
    private final long streamSessions;
    private final int rank;
}