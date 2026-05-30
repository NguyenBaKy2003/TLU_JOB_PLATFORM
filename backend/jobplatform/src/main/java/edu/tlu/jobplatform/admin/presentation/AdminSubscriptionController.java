package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.AdminSubscriptionUseCase;
import edu.tlu.jobplatform.admin.presentation.dto.request.ExtendExpiryRequest;
import edu.tlu.jobplatform.admin.presentation.dto.request.GrantQuotaRequest;
import edu.tlu.jobplatform.admin.presentation.dto.request.ReasonRequest;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * GET /api/v1/admin/subscriptions/company/{companyId} — Lịch sử subscription
 * GET /api/v1/admin/subscriptions/company/{companyId}/active — Subscription
 * đang active
 * POST /api/v1/admin/subscriptions/company/{companyId}/grant-quota — Cấp thêm
 * quota
 * POST /api/v1/admin/subscriptions/company/{companyId}/extend — Gia hạn thủ
 * công
 * POST /api/v1/admin/subscriptions/company/{companyId}/revoke — Thu hồi
 * GET /api/v1/admin/subscriptions/plans — Danh sách plans
 */
@RestController
@RequestMapping("/api/v1/admin/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Admin - Subscriptions")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminSubscriptionController {

        private final AdminSubscriptionUseCase adminSubscriptionUseCase;

        @Operation(summary = "Danh sách tất cả subscriptions trong hệ thống")
        @GetMapping
        public ResponseEntity<ApiResponse<PageResponse<CompanySubscription>>> listAll(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size,
                        @RequestParam(defaultValue = "createdAt") String sortBy,
                        @RequestParam(defaultValue = "desc") String direction) {

                Sort sort = direction.equalsIgnoreCase("asc")
                                ? Sort.by(sortBy).ascending()
                                : Sort.by(sortBy).descending();

                Pageable pageable = PageRequest.of(page, size, sort);
                PageResponse<CompanySubscription> result = adminSubscriptionUseCase.listAll(pageable);

                return ResponseEntity.ok(ApiResponse.success(result));
        }

        @Operation(summary = "Lịch sử subscription của công ty")
        @GetMapping("/company/{companyId}")
        public ResponseEntity<ApiResponse<List<CompanySubscription>>> listByCompany(
                        @PathVariable UUID companyId) {
                return ResponseEntity.ok(
                                ApiResponse.success(adminSubscriptionUseCase.listByCompany(companyId)));
        }

        @Operation(summary = "Subscription đang active")
        @GetMapping("/company/{companyId}/active")
        public ResponseEntity<ApiResponse<CompanySubscription>> getActive(
                        @PathVariable UUID companyId) {
                return ResponseEntity.ok(
                                ApiResponse.success(adminSubscriptionUseCase.getActive(companyId)));
        }

        @Operation(summary = "Cấp thêm quota đăng bài (hỗ trợ khách hàng / bug fix)")
        @PostMapping("/company/{companyId}/grant-quota")
        public ResponseEntity<ApiResponse<CompanySubscription>> grantQuota(
                        @PathVariable UUID companyId,
                        @Valid @RequestBody GrantQuotaRequest req) {
                var sub = adminSubscriptionUseCase.grantJobPostQuota(
                                companyId, req.getAmount(), req.getReason());
                return ResponseEntity.ok(
                                ApiResponse.success(sub, "Đã cấp thêm " + req.getAmount() + " quota đăng bài."));
        }

        @Operation(summary = "Gia hạn subscription thủ công (khách hàng VIP)")
        @PostMapping("/company/{companyId}/extend")
        public ResponseEntity<ApiResponse<CompanySubscription>> extend(
                        @PathVariable UUID companyId,
                        @Valid @RequestBody ExtendExpiryRequest req) {
                var sub = adminSubscriptionUseCase.extendExpiry(
                                companyId, req.getDays(), req.getReason());
                return ResponseEntity.ok(
                                ApiResponse.success(sub, "Đã gia hạn thêm " + req.getDays() + " ngày."));
        }

        @Operation(summary = "Thu hồi subscription (vi phạm)")
        @PostMapping("/company/{companyId}/revoke")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<CompanySubscription>> revoke(
                        @PathVariable UUID companyId,
                        @Valid @RequestBody ReasonRequest req) {
                var sub = adminSubscriptionUseCase.revoke(companyId, req.getReason());
                return ResponseEntity.ok(
                                ApiResponse.success(sub, "Subscription đã bị thu hồi."));
        }

        @Operation(summary = "Danh sách tất cả plans")
        @GetMapping("/plans")
        public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> listPlans() {
                return ResponseEntity.ok(
                                ApiResponse.success(adminSubscriptionUseCase.listAllPlans()));
        }
}