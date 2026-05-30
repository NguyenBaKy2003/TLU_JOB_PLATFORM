package edu.tlu.jobplatform.ai.presentation;

import edu.tlu.jobplatform.ai.application.usecase.CalculateCompetitionRateUseCase;
import edu.tlu.jobplatform.ai.application.usecase.CalculatePassProbabilityUseCase;
import edu.tlu.jobplatform.ai.domain.model.CompetitionRateResult;
import edu.tlu.jobplatform.ai.domain.model.PassProbabilityResult;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/job-posts")
@RequiredArgsConstructor
@Tag(name = "Job Post Public APIs", description = "Tính năng AI dùng chung")
public class JobPostAnalyticsController {

    private final CalculateCompetitionRateUseCase competitionUseCase;
    private final CalculatePassProbabilityUseCase passProbabilityUseCase;

    @Operation(summary = "Tính mức độ cạnh tranh của job")
    @GetMapping("/{id}/competition-rate")
    @RateLimit(policy = "public-analytics", scope = RateLimitPolicy.Scope.IP)
    public ResponseEntity<ApiResponse<CompetitionRateResult>> getCompetitionRate(
            @PathVariable UUID id) {

        CompetitionRateResult result = competitionUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "Tính xác suất đỗ job cho candidate")
    @GetMapping("/{jobId}/pass-probability")
    @PreAuthorize("hasRole('CANDIDATE')")
    @RateLimit(policy = "ai-recommend", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<PassProbabilityResult>> passProbability(
            @PathVariable UUID jobId) {

        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

        PassProbabilityResult result = passProbabilityUseCase.execute(
                new CalculatePassProbabilityUseCase.Command(candidateId, jobId));

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}