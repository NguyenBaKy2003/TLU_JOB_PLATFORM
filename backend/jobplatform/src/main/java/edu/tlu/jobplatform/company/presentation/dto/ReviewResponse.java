package edu.tlu.jobplatform.company.presentation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReviewResponse {

    private final UUID id;
    private final UUID companyId;
    private final UUID reviewerId; // null khi anonymous
    private final int rating;
    private final String title;
    private final String content;
    private final String pros;
    private final String cons;
    private final boolean anonymous;
    private final boolean employed;
    private final LocalDateTime createdAt;

    public static ReviewResponse from(CompanyReview r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .companyId(r.getCompanyId())
                .reviewerId(r.isAnonymous() ? null : r.getReviewerId())
                .rating(r.getRating())
                .title(r.getTitle())
                .content(r.getContent())
                .pros(r.getPros())
                .cons(r.getCons())
                .anonymous(r.isAnonymous())
                .employed(r.isEmployed())
                .createdAt(r.getCreatedAt())
                .build();
    }
}