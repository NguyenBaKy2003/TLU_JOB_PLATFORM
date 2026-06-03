package edu.tlu.jobplatform.subscription.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanySubscriptionResponse {

    private UUID id;
    private UUID companyId;
    private String planName;
    private String status;
    private int jobPostQuota;
    private int jobPostUsed;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    // ── Company snapshot ──────────────────────────────────────────────────────
    private String companyName;
    private String companySlug;
    private String companyLogoUrl;
    private String companyIndustry;
    private String companyEmail;

    // ── Factory ───────────────────────────────────────────────────────────────

    public static CompanySubscriptionResponse from(CompanySubscription sub) {
        return CompanySubscriptionResponse.builder()
                .id(sub.getId())
                .companyId(sub.getCompanyId())
                .planName(sub.getPlanCode())
                .status(sub.getStatus().name())
                .jobPostQuota(sub.getJobPostQuota().getLimit())
                .jobPostUsed(sub.getJobPostQuota().getUsed())
                .startedAt(sub.getStartedAt())
                .expiresAt(sub.getExpiresAt())
                .createdAt(sub.getCreatedAt())
                .build();
    }

    public static CompanySubscriptionResponse from(CompanySubscription sub, CompanyProfile company) {
        CompanySubscriptionResponse response = from(sub);
        if (company != null) {
            response.setCompanyName(company.getName());
            response.setCompanySlug(company.getSlug());
            response.setCompanyLogoUrl(company.getLogoUrl());
            response.setCompanyIndustry(company.getIndustry());
            response.setCompanyEmail(company.getEmail());
        }
        return response;
    }
}