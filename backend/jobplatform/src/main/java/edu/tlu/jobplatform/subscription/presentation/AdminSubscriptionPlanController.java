package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.subscription.application.usecase.CreateSubscriptionPlanUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.UpdateSubscriptionPlanUseCase;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.presentation.dto.request.CreatePlanRequest;
import edu.tlu.jobplatform.subscription.presentation.dto.request.UpdatePlanRequest;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.job.application.usecase.admin.GetAllPlansUseCase;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
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
 */
@RestController
@RequestMapping("/api/v1/admin/subscription-plans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Subscription Plans", description = "Quản lý gói dịch vụ (chỉ Admin)")
public class AdminSubscriptionPlanController {

        private final GetAllPlansUseCase getAllPlansUseCase;
        private final CreateSubscriptionPlanUseCase createPlanUseCase;
        private final UpdateSubscriptionPlanUseCase updatePlanUseCase;

        // GET /api/v1/admin/subscription-plans
        /**
         * Lấy TẤT CẢ plan, bao gồm các plan đã bị tắt (active = false).
         *
         */
        @Operation(summary = "Lấy danh sách tất cả gói dịch vụ (kể cả inactive)")
        @GetMapping
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> getAllPlans() {
                return ResponseEntity.ok(ApiResponse.success(getAllPlansUseCase.execute()));
        }

        // POST /api/v1/admin/subscription-plans

        @Operation(summary = "Tạo gói dịch vụ mới")
        @PostMapping
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_CREATE_SUBSCRIPTION_PLAN", resourceType = "SubscriptionPlan")
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

        // PATCH /api/v1/admin/subscription-plans/{planId}

        /**
         * Cập nhật một phần thông tin gói dịch vụ (PATCH / partial update).
         * Chỉ cần gửi các field muốn thay đổi.
         *
         * Toggle active ON: { "active": true }
         * Toggle active OFF: { "active": false }
         * Đổi giá: { "priceMonthly": 1800000, "priceYearly": 17000000 }
         *
         * 
         */
        @Operation(summary = "Cập nhật gói dịch vụ (partial update). Dùng { \"active\": false } để deactivate.")
        @PatchMapping("/{planId}")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_UPDATE_SUBSCRIPTION_PLAN", resourceType = "SubscriptionPlan")
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