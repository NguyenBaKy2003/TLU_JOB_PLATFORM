package edu.tlu.jobplatform.subscription.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CandidateSubscriptionResponse {

    private UUID id;
    private UUID candidateId;
    private String planName;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    // ── Candidate snapshot ────────────────────────────────────────────────────
    private String candidateName;
    private String candidateAvatarUrl;
    private String candidateHeadline;
    private String candidateLocation;

    // ── Factory ───────────────────────────────────────────────────────────────

    public static CandidateSubscriptionResponse from(CandidateSubscription sub) {
        return CandidateSubscriptionResponse.builder()
                .id(sub.getId())
                .candidateId(sub.getCandidateId())
                .planName(sub.getPlanCode())
                .status(sub.getStatus().name())
                .startedAt(sub.getStartedAt())
                .expiresAt(sub.getExpiresAt())
                .createdAt(sub.getCreatedAt())
                .build();
    }

    public static CandidateSubscriptionResponse from(CandidateSubscription sub, CandidateProfile profile) {
        CandidateSubscriptionResponse response = from(sub);
        if (profile != null) {
            response.setCandidateName(
                    (profile.getFirstName() + " " + profile.getLastName()).trim());
            response.setCandidateAvatarUrl(profile.getAvatarUrl());
            response.setCandidateHeadline(profile.getHeadline());
            response.setCandidateLocation(profile.getLocation());
        }
        return response;
    }
}