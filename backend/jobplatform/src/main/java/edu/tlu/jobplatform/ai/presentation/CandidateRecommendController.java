package edu.tlu.jobplatform.ai.presentation;

import edu.tlu.jobplatform.ai.application.usecase.GetRecommendationsUseCase;
import edu.tlu.jobplatform.ai.application.usecase.TrackCandidateBehaviorUseCase;
import edu.tlu.jobplatform.ai.domain.model.AutocompleteResult;
import edu.tlu.jobplatform.ai.infrastructure.persistence.adapter.SmartAutocompleteAdapter;
import edu.tlu.jobplatform.candidate.application.usecase.profile.ResolveCandidateIdUseCase;
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
    private final ResolveCandidateIdUseCase resolveCandidateId; // thêm

    @Operation(summary = "Lấy gợi ý job và công ty — yêu cầu đăng nhập")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/recommendations")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<GetRecommendationsUseCase.RecommendationBundle>> getRecommendations(
            @CurrentUser UUID userId) {

        // userId → candidateProfileId
        UUID candidateId = resolveCandidateId.execute(userId);
        return ResponseEntity.ok(ApiResponse.success(
                recommendUseCase.execute(candidateId)));
    }

    @Operation(summary = "Gợi ý từ khóa — không cần đăng nhập, cá nhân hóa nếu có token")
    @GetMapping("/autocomplete")
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

    @Operation(summary = "Ghi nhận từ khóa tìm kiếm — chỉ khi đã đăng nhập")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/track/search")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Void> trackSearch(
            @CurrentUser UUID userId,
            @RequestParam String keyword) {

        UUID candidateId = resolveCandidateId.execute(userId);
        trackUseCase.trackSearch(candidateId, keyword);
        return ResponseEntity.accepted().build();
    }

    @Operation(summary = "Ghi nhận lượt xem job — chỉ khi đã đăng nhập")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/track/job-view")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Void> trackJobView(
            @CurrentUser UUID userId,
            @RequestParam UUID jobPostId,
            @RequestParam(defaultValue = "0") int dwellSeconds) {

        UUID candidateId = resolveCandidateId.execute(userId);
        trackUseCase.trackJobView(candidateId, jobPostId, dwellSeconds);
        return ResponseEntity.accepted().build();
    }
}