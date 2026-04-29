package edu.tlu.jobplatform.livestream.presentation.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

// ─── InterviewSlotRequest ─────────────────────────────────────
public record InterviewSlotRequest(

        @NotNull LocalDateTime startTime,

        @Min(value = 15, message = "Slot tối thiểu 15 phút") @Max(value = 120, message = "Slot tối đa 120 phút") int durationMinutes) {
}
