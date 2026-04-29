package edu.tlu.jobplatform.livestream.presentation.dto.request;

import jakarta.validation.constraints.*;

import java.util.UUID;

// ─── RespondPollRequest (Candidate) ───────────────────────────
public record RespondPollRequest(

        @NotNull UUID pollEventId,

        @Min(0) int optionIndex) {
}