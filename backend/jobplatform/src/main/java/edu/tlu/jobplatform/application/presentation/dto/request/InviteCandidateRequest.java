package edu.tlu.jobplatform.application.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
public class InviteCandidateRequest {

    @NotNull(message = "candidateProfileId không được để trống")
    private UUID candidateProfileId;

    @Size(max = 1000, message = "Lời nhắn không được vượt quá 1000 ký tự")
    private String personalMessage;
}