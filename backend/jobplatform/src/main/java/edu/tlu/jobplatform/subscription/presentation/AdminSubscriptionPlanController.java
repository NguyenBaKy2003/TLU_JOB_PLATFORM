package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.subscription.application.usecase.CreateSubscriptionPlanUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.UpdateSubscriptionPlanUseCase;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.presentation.dto.request.CreatePlanRequest;
import edu.tlu.jobplatform.subscription.presentation.dto.request.UpdatePlanRequest;
import edu.tlu.jobplatform.job.application.usecase.admin.GetAllPlansUseCase;
import edu.tlu.jobplatform.shared.response.ApiResponse;
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
 * REST Controller: Admin quản lý gói dịch vụ.
 *
 * Base path: /api/v1/admin/subscription-plans
 *
 * Endpoints:
 * GET / — Tất cả plan (kể cả inactive)
 * POST / — Tạo plan mới
 * PATCH /{planId} — Cập nhật plan (partial update), dùng cho cả toggle active
 *
 * Tất cả endpoint yêu cầu role ADMIN.
 *
 * FIX: Removed the separate /deactivate endpoint — toggling active/inactive is
 * done via PATCH /{planId} with { "active": false } or { "active": true }.
 * The frontend sends only the `active` field when toggling, so no separate
 * endpoint is needed and the API surface stays consistent.
 */
@RestController
@RequestMapping("/api/v1/admin/subscription-plans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Subscription Plans", description = "Quản lý gói dịch vụ (chỉ Admin)")
public class AdminSubscriptionPlanController {

        // FIX: use GetAllPlansUseCase (returns active + inactive) instead of
        // GetAvailablePlansUseCase (returns only active — meant for the public pricing
        // page)
        private final GetAllPlansUseCase getAllPlansUseCase;
        private final CreateSubscriptionPlanUseCase createPlanUseCase;
        private final UpdateSubscriptionPlanUseCase updatePlanUseCase;

        // ─────────────────
        // GET /api/v1/admin/subscription-plans
        // ─────────────────

        /**
         * Lấy TẤT CẢ plan, bao gồm các plan đã bị tắt (active = false).
         *
         * FIX: endpoint cũ dùng GetAvailablePlansUseCase chỉ trả về active plans,
         * nên admin không thể thấy / bật lại các plan đã tắt.
         */
        @GetMapping
        @Operation(summary = "Lấy danh sách tất cả gói dịch vụ (kể cả inactive)")
        public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> getAllPlans() {
                return ResponseEntity.ok(ApiResponse.success(getAllPlansUseCase.execute()));
        }

        // ─────────────────
        // POST /api/v1/admin/subscription-plans
        // ─────────────────

        /**
         * Tạo gói dịch vụ mới.
         *
         * Request body:
         * {
         * "code": "BUSINESS",
         * "name": "Gói Business",
         * "description": "Dành cho doanh nghiệp vừa",
         * "priceMonthly": 1500000,
         * "priceYearly": 14400000,
         * "jobPostLimit": 20,
         * "featuredJobLimit": 5,
         * "cvViewLimit": 200,
         * "aiFeatures": true,
         * "analyticsAccess": true,
         * "durationDays": 30
         * }
         */
        @PostMapping
        @Operation(summary = "Tạo gói dịch vụ mới")
        public ResponseEntity<ApiResponse<SubscriptionPlan>> createPlan(
                        @Valid @RequestBody CreatePlanRequest request) {

                CreateSubscriptionPlanUseCase.Command cmd = new CreateSubscriptionPlanUseCase.Command(
                                request.code(),
                                request.name(),
                                request.description(),
                                request.priceMonthly(),
                                request.priceYearly(),
                                request.jobPostLimit(),
                                request.featuredJobLimit(),
                                request.cvViewLimit(),
                                request.aiFeatures(),
                                request.analyticsAccess(),
                                request.durationDays());

                SubscriptionPlan created = createPlanUseCase.execute(cmd);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(created));
        }

        // ─────────────────
        // PATCH /api/v1/admin/subscription-plans/{planId}
        // ─────────────────

        /**
         * Cập nhật một phần thông tin gói dịch vụ (PATCH / partial update).
         * Chỉ cần gửi các field muốn thay đổi.
         *
         * Toggle active ON: { "active": true }
         * Toggle active OFF: { "active": false }
         * Đổi giá: { "priceMonthly": 1800000, "priceYearly": 17000000 }
         *
         * FIX: Removed the separate DELETE /{planId}/deactivate endpoint.
         * Deactivating is simply PATCH with { "active": false }, which is already
         * supported here. Having two paths for the same operation was confusing
         * and caused the frontend to call a non-existent /toggle endpoint.
         */
        @PatchMapping("/{planId}")
        @Operation(summary = "Cập nhật gói dịch vụ (partial update). Dùng { \"active\": false } để deactivate.")
        public ResponseEntity<ApiResponse<SubscriptionPlan>> updatePlan(
                        @PathVariable UUID planId,
                        @RequestBody UpdatePlanRequest request) {

                UpdateSubscriptionPlanUseCase.Command cmd = new UpdateSubscriptionPlanUseCase.Command(
                                request.name(),
                                request.description(),
                                request.priceMonthly(),
                                request.priceYearly(),
                                request.jobPostLimit(),
                                request.featuredJobLimit(),
                                request.cvViewLimit(),
                                request.aiFeatures(),
                                request.analyticsAccess(),
                                request.durationDays(),
                                request.active());

                SubscriptionPlan updated = updatePlanUseCase.execute(planId, cmd);
                return ResponseEntity.ok(ApiResponse.success(updated));
        }
}