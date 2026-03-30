package edu.tlu.jobplatform.company.presentation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.CompanySize;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Thông tin hồ sơ công ty")
public class CompanyResponse {

    private final UUID id;
    private final UUID ownerId;
    private final String name;
    private final String slug;
    private final String description;
    private final String website;
    private final String email;
    private final String phone;
    private final String address;
    private final String city;
    private final String country;
    private final String industry;
    private final CompanySize size;
    private final String sizeLabel; // "51 - 200" — computed
    private final Integer foundedYear;
    private final String logoUrl;
    private final String coverImageUrl;
    private final VerificationStatus verificationStatus;
    private final String rejectionReason;
    private final boolean canPostJobs; // computed
    private final LocalDateTime verifiedAt;
    private final LocalDateTime createdAt;

    public static CompanyResponse from(CompanyProfile c) {
        return CompanyResponse.builder()
                .id(c.getId())
                .ownerId(c.getOwnerId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .website(c.getWebsite())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .city(c.getCity())
                .country(c.getCountry())
                .industry(c.getIndustry())
                .size(c.getSize())
                .sizeLabel(c.getSize() != null ? c.getSize().getLabel() : null)
                .foundedYear(c.getFoundedYear())
                .logoUrl(c.getLogoUrl())
                .coverImageUrl(c.getCoverImageUrl())
                .verificationStatus(c.getVerificationStatus())
                .rejectionReason(c.getRejectionReason())
                .canPostJobs(c.canPostJobs())
                .verifiedAt(c.getVerifiedAt())
                .createdAt(c.getCreatedAt())
                .build();
    }
}