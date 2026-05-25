package edu.tlu.jobplatform.subscription.presentation;

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

    // ── GET / ─────────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Lấy tất cả gói Candidate (kể cả inactive)")
    public ResponseEntity<ApiResponse<List<CandidateSubscriptionPlan>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(planRepository.findAll()));
    }

    // ── POST / ────────────────────────────────────────────────────────

    /**
     * Ví dụ body tạo gói FREE_CANDIDATE (miễn phí):
     * {
     * "code": "FREE_CANDIDATE",
     * "name": "Gói Cơ Bản",
     * "description": "Miễn phí, 5 đơn/tháng, tạo 1 CV, template thường",
     * "priceMonthly": null,
     * "priceYearly": null,
     * "applicationLimit": 5,
     * "cvBoostLimit": 0,
     * "cvCreateLimit": 1,
     * "aiCvWriter": false,
     * "premiumTemplateAccess": false,
     * "durationDays": null,
     * "free": true,
     * "active": true
     * }
     * 
     * Ví dụ body tạo gói PRO:
     * {
     * "code": "PRO",
     * "name": "Gói Chuyên Nghiệp",
     * "description": "99k/tháng, unlimited apply, boost CV, tạo 5 CV, template
     * premium",
     * "priceMonthly": 99000,
     * "priceYearly": 899000,
     * "applicationLimit": -1,
     * "cvBoostLimit": 3,
     * "cvCreateLimit": 5,
     * "aiCvWriter": false,
     * "premiumTemplateAccess": true,
     * "durationDays": 30,
     * "free": false,
     * "active": true
     * }
     * 
     * Ví dụ body tạo gói PREMIUM:
     * {
     * "code": "PREMIUM",
     * "name": "Gói Cao Cấp",
     * "description": "199k/tháng, tất cả Pro + AI viết CV, tạo unlimited CV,
     * template premium",
     * "priceMonthly": 199000,
     * "priceYearly": 1799000,
     * "applicationLimit": -1,
     * "cvBoostLimit": 10,
     * "cvCreateLimit": -1,
     * "aiCvWriter": true,
     * "premiumTemplateAccess": true,
     * "durationDays": 30,
     * "free": false,
     * "active": true
     * }
     */
    @PostMapping
    @Operation(summary = "Tạo gói dịch vụ Candidate mới")
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

    /**
     * Partial update - chỉ gửi các field muốn thay đổi.
     * 
     * Ví dụ toggle active: { "active": false }
     * Ví dụ đổi giá: { "priceMonthly": 120000, "priceYearly": 1090000 }
     * Ví dụ nâng cấp tính năng: { "aiCvWriter": true, "premiumTemplateAccess": true
     * }
     * Ví dụ tăng quota: { "applicationLimit": -1, "cvBoostLimit": 5,
     * "cvCreateLimit": -1 }
     */
    @PatchMapping("/{planId}")
    @Operation(summary = "Cập nhật gói Candidate (partial update). Chỉ gửi các field cần thay đổi.")
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