package edu.tlu.jobplatform.application.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class InviteCandidateResponse {

    private final UUID jobPostId;
    private final UUID candidateProfileId;
    private final String candidateName;
    private final String jobTitle;

    /** true nếu email đã được dispatch (async — không đảm bảo delivered) */
    private final boolean emailDispatched;

    /** true nếu in-app notification đã được lưu */
    private final boolean notificationSaved;

    private final LocalDateTime invitedAt;
}