package edu.tlu.jobplatform.ai.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record CompareCandidatesRequest(
        @NotEmpty @Size(min = 2, max = 10) @Schema(description = "Danh sách application IDs", example = "[\"550e8400-e29b-41d4-a716-446655440000\"]") List<UUID> applicationIds) {
}