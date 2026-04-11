package edu.tlu.jobplatform.ai.presentation;

import edu.tlu.jobplatform.ai.domain.model.JdOptimizationResult;
import edu.tlu.jobplatform.ai.usecase.OptimizeJdUseCase;
import edu.tlu.jobplatform.ai.usecase.RetriggerAIScoreUseCase;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * AI endpoints cho Employer:
 *   POST /api/v1/ai/optimize-jd          — Tối ưu JD
 *   POST /api/v1/ai/applications/{id}/rescore — Chạy lại AI scoring
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "Tính năng AI cho nhà tuyển dụng")
@SecurityRequirement(name = "bearerAuth")
public class AiController {

    private final OptimizeJdUseCase        optimizeJdUseCase;
    private final RetriggerAIScoreUseCase  retriggerUseCase;

    @Operation(summary = "Tối ưu hóa Job Description bằng AI")
    @PostMapping("/optimize-jd")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<JdOptimizationResult>> optimizeJd(
            @Valid @RequestBody OptimizeJdRequest req) {

        JdOptimizationResult result = optimizeJdUseCase.execute(
            new OptimizeJdUseCase.Command(
                req.title(), req.description(),
                req.requirements(), req.level(), req.category()));

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "Chạy lại AI scoring cho đơn ứng tuyển")
    @PostMapping("/applications/{id}/rescore")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> rescore(@PathVariable UUID id) {
        retriggerUseCase.execute(id);   // async — không chờ kết quả
        return ResponseEntity.ok(
            ApiResponse.success("Đang tính điểm AI. Kết quả sẽ cập nhật trong vài giây."));
    }

    public record OptimizeJdRequest(
        @NotBlank String title,
        String description,
        String requirements,
        String level,
        String category
    ) {}
}
