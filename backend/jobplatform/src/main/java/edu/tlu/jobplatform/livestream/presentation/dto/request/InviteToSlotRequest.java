package edu.tlu.jobplatform.livestream.presentation.dto.request;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record InviteToSlotRequest(

        @NotNull UUID candidateId,

        @NotNull UUID slotId) {
}
