package edu.tlu.jobplatform.livestream.presentation.dto.request;

import jakarta.validation.constraints.*;

import java.util.UUID;

//  SpotlightJobRequest ──
public record SpotlightJobRequest(

        @NotNull(message = "jobPostId không được để trống") UUID jobPostId) {
}
