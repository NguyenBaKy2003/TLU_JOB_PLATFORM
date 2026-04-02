package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.subscription.application.usecase.CreateSubscriptionPlanUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.GetAvailablePlansUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.UpdateSubscriptionPlanUseCase;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.presentation.dto.request.CreatePlanRequest;
import edu.tlu.jobplatform.subscription.presentation.dto.request.UpdatePlanRequest;
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
 * GET / — Lấy tất cả plan (kể cả inactive)
 * POST / — Tạo plan mới
 * PATCH /{planId} — Cập nhật plan (partial update)
 * DELETE /{planId}/deactivate — Deactivate plan (soft delete)
 *
 * Tất cả endpoint yêu cầu role ADMIN.
 */
@RestController
@RequestMapping("/api/v1/admin/subscription-plans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Subscription Plans", description = "Quản lý gói dịch vụ (chỉ Admin)")
public class AdminSubscriptionPlanController {

        private final GetAvailablePlansUseCase getAvailablePlansUseCase;
        private final CreateSubscriptionPlanUseCase createPlanUseCase;
        private final UpdateSubscriptionPlanUseCase updatePlanUseCase;

        // ─────────────────────────────────────────────────────────────
        // GET /api/v1/admin/subscription-plans
        // ─────────────────────────────────────────────────────────────

        /**
         * Lấy tất cả plan đang active.
         * (Nếu cần cả inactive thì mở rộng repository thêm findAll)
         */
        @GetMapping
        @Operation(summary = "Lấy danh sách tất cả gói dịch vụ")
        public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> getAllPlans() {
                return ResponseEntity.ok(ApiResponse.success(getAvailablePlansUseCase.execute()));
        }

        // ─────────────────────────────────────────────────────────────
        // POST /api/v1/admin/subscription-plans
        // ─────────────────────────────────────────────────────────────

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

        // ─────────────────────────────────────────────────────────────
        // PATCH /api/v1/admin/subscription-plans/{planId}
        // ─────────────────────────────────────────────────────────────

        /**
         * Cập nhật một phần thông tin gói dịch vụ (PATCH).
         * Chỉ cần gửi các field muốn thay đổi.
         *
         * Ví dụ chỉ đổi giá:
         * { "priceMonthly": 1800000, "priceYearly": 17000000 }
         *
         * Ví dụ deactivate:
         * { "active": false }
         */
        @PatchMapping("/{planId}")
        @Operation(summary = "Cập nhật gói dịch vụ (partial update)")
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

        // ─────────────────────────────────────────────────────────────
        // DELETE /api/v1/admin/subscription-plans/{planId}/deactivate
        // ─────────────────────────────────────────────────────────────

        /**
         * Deactivate gói dịch vụ (soft delete).
         * Plan sẽ không hiển thị trên trang pricing nữa,
         * nhưng các subscription đang active vẫn giữ nguyên.
         *
         * Không dùng DELETE thực sự vì cần giữ lại dữ liệu lịch sử.
         */
        @DeleteMapping("/{planId}/deactivate")
        @Operation(summary = "Deactivate gói dịch vụ (soft delete)")
        public ResponseEntity<ApiResponse<SubscriptionPlan>> deactivatePlan(
                        @PathVariable UUID planId) {

                UpdateSubscriptionPlanUseCase.Command cmd = new UpdateSubscriptionPlanUseCase.Command(
                                null, null, null, null,
                                null, null, null, null, null, null,
                                false // chỉ set active = false
                );

                SubscriptionPlan updated = updatePlanUseCase.execute(planId, cmd);
                return ResponseEntity.ok(ApiResponse.success(updated));
        }

}