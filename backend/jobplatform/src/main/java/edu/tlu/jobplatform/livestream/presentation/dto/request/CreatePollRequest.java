package edu.tlu.jobplatform.livestream.presentation.dto.request;

import jakarta.validation.constraints.*;

import java.util.List;

// ─── CreatePollRequest ────────────────────────────────────────
public record CreatePollRequest(

        @NotBlank String question,

        @NotEmpty @Size(min = 2, max = 6, message = "Poll cần 2-6 lựa chọn") List<String> options) {
}
