package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.subscription.application.usecase.CreateCandidatePlanUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.UpdateCandidatePlanUseCase;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionPlanRepository;
import edu.tlu.jobplatform.subscription.presentation.dto.request.CreateCandidatePlanRequest;
import edu.tlu.jobplatform.subscription.presentation.dto.request.UpdateCandidatePlanRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller: Admin quản lý gói dịch vụ Candidate.
 *
 * Base path: /api/v1/admin/candidate-plans
 *
 * Endpoints:
 * GET / — Tất cả plan (kể cả inactive)
 * POST / — Tạo plan mới
 * PATCH /{planId} — Cập nhật plan (partial update / toggle active)
 *
 * Tất cả endpoint yêu cầu role ADMIN.
 */
@RestController
@RequestMapping("/api/v1/admin/candidate-plans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Candidate Plans", description = "Quản lý gói dịch vụ Candidate (chỉ Admin)")
public class AdminCandidateSubscriptionPlanController {

    private final CandidateSubscriptionPlanRepository planRepository;
    private final CreateCandidatePlanUseCase createPlanUseCase;
    private final UpdateCandidatePlanUseCase updatePlanUseCase;

    // ── GET / ────────

    @Operation(summary = "Lấy tất cả gói Candidate (kể cả inactive)")
    @GetMapping
    @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<List<CandidateSubscriptionPlan>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(planRepository.findAll()));
    }

    @PostMapping
    @Operation(summary = "Tạo gói dịch vụ Candidate mới")
    @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "ADMIN_CREATE_CANDIDATE_PLAN", resourceType = "CandidateSubscriptionPlan")
    public ResponseEntity<ApiResponse<CandidateSubscriptionPlan>> create(
            @Valid @RequestBody CreateCandidatePlanRequest req) {

        CreateCandidatePlanUseCase.Command cmd = new CreateCandidatePlanUseCase.Command(
                req.code(),
                req.name(),
                req.description(),
                req.priceMonthly(),
                req.priceYearly(),
                req.applicationLimit(),
                req.cvBoostLimit(),
                req.cvCreateLimit(),
                req.aiCvWriter(),
                req.premiumTemplateAccess(),
                req.durationDays(),
                req.free());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createPlanUseCase.execute(cmd)));
    }

    // ── PATCH /{planId} ───────────────────────────────────────────────

    @Operation(summary = "Cập nhật gói Candidate (partial update). Chỉ gửi các field cần thay đổi.")
    @PatchMapping("/{planId}")
    @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "ADMIN_UPDATE_CANDIDATE_PLAN", resourceType = "CandidateSubscriptionPlan")
    public ResponseEntity<ApiResponse<CandidateSubscriptionPlan>> update(
            @PathVariable UUID planId,
            @Valid @RequestBody UpdateCandidatePlanRequest req) {

        UpdateCandidatePlanUseCase.Command cmd = new UpdateCandidatePlanUseCase.Command(
                req.name(),
                req.description(),
                req.priceMonthly(),
                req.priceYearly(),
                req.applicationLimit(),
                req.cvBoostLimit(),
                req.cvCreateLimit(),
                req.aiCvWriter(),
                req.premiumTemplateAccess(),
                req.durationDays(),
                req.active());

        return ResponseEntity.ok(ApiResponse.success(updatePlanUseCase.execute(planId, cmd)));
    }
}