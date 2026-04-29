package edu.tlu.jobplatform.livestream.presentation.dto.request;

import jakarta.validation.constraints.*;

// ─── SubmitQARequest (Candidate) ──────────────────────────────
public record SubmitQARequest(

        @NotBlank @Size(max = 500, message = "Câu hỏi không được vượt quá 500 ký tự") String question) {
}
