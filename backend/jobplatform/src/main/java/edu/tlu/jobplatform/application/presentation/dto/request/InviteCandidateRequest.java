package edu.tlu.jobplatform.application.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
public class InviteCandidateRequest {

    /**
     * Profile ID của ứng viên — lấy từ
     * CandidateSearchResult.MatchedCandidate.candidateProfileId.
     * Đây là CandidateProfile.id, không phải userId.
     */
    @NotNull(message = "candidateProfileId không được để trống")
    private UUID candidateProfileId;

    /**
     * Lời nhắn cá nhân từ employer gửi kèm lời mời.
     * Optional — nếu null thì dùng message mặc định trong template.
     */
    @Size(max = 1000, message = "Lời nhắn không được vượt quá 1000 ký tự")
    private String personalMessage;
}