package edu.tlu.jobplatform.ai.presentation;

import edu.tlu.jobplatform.ai.application.usecase.GetRecommendationsUseCase;
import edu.tlu.jobplatform.ai.application.usecase.TrackCandidateBehaviorUseCase;
import edu.tlu.jobplatform.ai.domain.model.AutocompleteResult;
import edu.tlu.jobplatform.ai.infrastructure.persistence.adapter.SmartAutocompleteAdapter;
import edu.tlu.jobplatform.candidate.application.usecase.profile.ResolveCandidateIdUseCase;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Recommendations")
public class CandidateRecommendController {

    private final GetRecommendationsUseCase recommendUseCase;
    private final SmartAutocompleteAdapter autocompleteAdapter;
    private final TrackCandidateBehaviorUseCase trackUseCase;
    private final ResolveCandidateIdUseCase resolveCandidateId;

    @Operation(summary = "Lấy gợi ý job và công ty")
    @GetMapping("/recommendations")
    @PreAuthorize("hasRole('CANDIDATE')")
    @RateLimit(policy = "ai-recommend", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<GetRecommendationsUseCase.RecommendationBundle>> getRecommendations(
            @CurrentUser UUID userId) {

        // userId → candidateProfileId
        UUID candidateId = resolveCandidateId.execute(userId);
        return ResponseEntity.ok(ApiResponse.success(
                recommendUseCase.execute(candidateId)));
    }

    @Operation(summary = "Gợi ý từ khóa — không cần đăng nhập")
    @GetMapping("/autocomplete")
    @RateLimit(policy = "ai-autocomplete", scope = RateLimitPolicy.Scope.IP)
    public ResponseEntity<ApiResponse<AutocompleteResult>> autocomplete(
            @RequestParam String q) {

        UUID candidateId = SecurityUtils.getCurrentUserId()
                .map(userId -> {
                    try {
                        return resolveCandidateId.execute(userId);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .orElse(null);

        return ResponseEntity.ok(ApiResponse.success(
                autocompleteAdapter.suggest(candidateId, q)));
    }

    @Operation(summary = "Ghi nhận từ khóa tìm kiếm")
    @PostMapping("/track/search")
    @PreAuthorize("hasRole('CANDIDATE')")
    @RateLimit(policy = "ai-track", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<Void> trackSearch(
            @CurrentUser UUID userId,
            @RequestParam String keyword) {

        UUID candidateId = resolveCandidateId.execute(userId);
        trackUseCase.trackSearch(candidateId, keyword);
        return ResponseEntity.accepted().build();
    }

    @Operation(summary = "Ghi nhận lượt xem job")
    @PostMapping("/track/job-view")
    @PreAuthorize("hasRole('CANDIDATE')")
    @RateLimit(policy = "ai-track", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<Void> trackJobView(
            @CurrentUser UUID userId,
            @RequestParam UUID jobPostId,
            @RequestParam(defaultValue = "0") int dwellSeconds) {

        UUID candidateId = resolveCandidateId.execute(userId);
        trackUseCase.trackJobView(candidateId, jobPostId, dwellSeconds);
        return ResponseEntity.accepted().build();
    }
}