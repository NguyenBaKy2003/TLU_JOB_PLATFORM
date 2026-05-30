package edu.tlu.jobplatform.ai.presentation;

import edu.tlu.jobplatform.ai.application.usecase.CheckJdGuidelinesUseCase;
import edu.tlu.jobplatform.ai.application.usecase.CompareCandidatesUseCase;
import edu.tlu.jobplatform.ai.application.usecase.OptimizeJdUseCase;
import edu.tlu.jobplatform.ai.application.usecase.RetriggerAIScoreUseCase;
import edu.tlu.jobplatform.ai.domain.model.CandidateComparisonResult;
import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckResult;
import edu.tlu.jobplatform.ai.domain.model.JdOptimizationResult;
import edu.tlu.jobplatform.ai.presentation.dto.request.CompareCandidatesRequest;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "Tính năng AI cho nhà tuyển dụng")
@SecurityRequirement(name = "bearerAuth")
public class AiController {

        private final OptimizeJdUseCase optimizeJdUseCase;
        private final RetriggerAIScoreUseCase retriggerUseCase;
        private final CheckJdGuidelinesUseCase checkGuidelinesUseCase;
        private final CompareCandidatesUseCase compareCandidatesUseCase;

        @Operation(summary = "Tối ưu hóa Job Description bằng AI")
        @PostMapping("/optimize-jd")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
        @RateLimit(policy = "ai-heavy", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "AI_OPTIMIZE_JD", resourceType = "JobPost")
        public ResponseEntity<ApiResponse<JdOptimizationResult>> optimizeJd(
                        @Valid @RequestBody OptimizeJdRequest req) {

                JdOptimizationResult result = optimizeJdUseCase.execute(
                                new OptimizeJdUseCase.Command(
                                                req.title(), req.description(),
                                                req.requirements(), req.benefits(), req.level(), req.category()));

                return ResponseEntity.ok(ApiResponse.success(result));
        }

        @Operation(summary = "Chạy lại AI scoring cho đơn ứng tuyển")
        @PostMapping("/applications/{id}/rescore")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
        @RateLimit(policy = "ai-heavy", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "AI_RESCORE_APPLICATION", resourceType = "Application")
        public ResponseEntity<ApiResponse<String>> rescore(@PathVariable UUID id) {
                retriggerUseCase.execute(id);
                return ResponseEntity.ok(
                                ApiResponse.success("Đang tính điểm AI. Kết quả sẽ cập nhật trong vài giây."));
        }

        @Operation(summary = "Kiểm tra JD có vi phạm community guidelines không")
        @PostMapping("/check-jd-guidelines")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
        @RateLimit(policy = "ai-heavy", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "AI_CHECK_JD_GUIDELINES", resourceType = "JobPost")

        public ResponseEntity<ApiResponse<JdGuidelineCheckResult>> checkGuidelines(
                        @Valid @RequestBody CheckGuidelinesRequest req) {

                JdGuidelineCheckResult result = checkGuidelinesUseCase.execute(
                                new CheckJdGuidelinesUseCase.Command(
                                                req.jobPostId(), req.title(), req.description(),
                                                req.requirements(), req.benefits()));

                if (result.getSeverity() == JdGuidelineCheckResult.Severity.VIOLATION) {
                        return ResponseEntity
                                        .status(HttpStatus.UNPROCESSABLE_ENTITY)
                                        .body(ApiResponse.errorWithData(
                                                        result,
                                                        "JD vi phạm nguyên tắc cộng đồng",
                                                        "JD_VIOLATION"));
                }

                return ResponseEntity.ok(ApiResponse.success(result));
        }

        @Operation(summary = "So sánh các ứng viên với nhau")
        @PostMapping("/jobs/{jobId}/compare-candidates")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
        @RateLimit(policy = "ai-heavy", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "AI_COMPARE_CANDIDATES", resourceType = "JobPost")
        public ResponseEntity<ApiResponse<CandidateComparisonResult>> compareCandidates(
                        @PathVariable UUID jobId,
                        @Valid @RequestBody CompareCandidatesRequest req) {

                CandidateComparisonResult result = compareCandidatesUseCase.execute(
                                new CompareCandidatesUseCase.Command(jobId, req.applicationIds()));

                return ResponseEntity.ok(ApiResponse.success(result));
        }

        // Request records ─

        public record OptimizeJdRequest(
                        @NotBlank String title,
                        String description,
                        String requirements,
                        String benefits,
                        String level,
                        String category) {
        }

        public record CheckGuidelinesRequest(
                        UUID jobPostId,
                        @NotBlank String title,
                        String description,
                        String requirements,
                        String benefits) {
        }

}