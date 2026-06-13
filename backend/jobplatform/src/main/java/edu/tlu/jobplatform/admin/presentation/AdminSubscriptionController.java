package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.AdminSubscriptionUseCase;
import edu.tlu.jobplatform.admin.application.usecase.export.AdminExportCompanySubscriptionsUseCase;
import edu.tlu.jobplatform.admin.presentation.dto.request.ExtendExpiryRequest;
import edu.tlu.jobplatform.admin.presentation.dto.request.GrantQuotaRequest;
import edu.tlu.jobplatform.admin.presentation.dto.request.ReasonRequest;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionStatus;
import edu.tlu.jobplatform.subscription.presentation.dto.response.CompanySubscriptionResponse;
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
 * GET /api/v1/admin/subscriptions — Danh sách tất cả (phân trang)
 * GET /api/v1/admin/subscriptions/export/excel — Xuất Excel
 * GET /api/v1/admin/subscriptions/export/pdf — Xuất PDF
 * GET /api/v1/admin/subscriptions/plans — Danh sách plans
 * GET /api/v1/admin/subscriptions/company/{id} — Lịch sử theo công ty
 * GET /api/v1/admin/subscriptions/company/{id}/active — Active hiện tại
 * POST /api/v1/admin/subscriptions/company/{id}/grant-quota — Cấp thêm quota
 * POST /api/v1/admin/subscriptions/company/{id}/extend — Gia hạn thủ công
 * POST /api/v1/admin/subscriptions/company/{id}/revoke — Thu hồi
 */
@RestController
@RequestMapping("/api/v1/admin/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Admin - Subscriptions", description = "Quản lý gói đăng ký Employer")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminSubscriptionController {

        private final AdminSubscriptionUseCase useCase;
        private final AdminExportCompanySubscriptionsUseCase exportUseCase;
        // ── List all ─────────────────────────────────────────────────────────────

        @Operation(summary = "Danh sách tất cả Company subscription")
        @GetMapping
        public ResponseEntity<ApiResponse<PageResponse<CompanySubscriptionResponse>>> listAll(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size,
                        @RequestParam(defaultValue = "createdAt") String sortBy,
                        @RequestParam(defaultValue = "desc") String direction,
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) SubscriptionStatus status) {

                Sort sort = direction.equalsIgnoreCase("asc")
                                ? Sort.by(sortBy).ascending()
                                : Sort.by(sortBy).descending();
                Pageable pageable = PageRequest.of(page, size, sort);
                return ResponseEntity.ok(ApiResponse.success(
                                useCase.listAll(keyword, status, pageable)));
        }

        // ── Plans ─────────────────────────────────────────────────────────────────

        @Operation(summary = "Danh sách tất cả plans")
        @GetMapping("/plans")
        public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> listPlans() {
                return ResponseEntity.ok(ApiResponse.success(useCase.listAllPlans()));
        }

        // ── Per-company actions ───────────────────────────────────────────────────

        @Operation(summary = "Lịch sử subscription của công ty")
        @GetMapping("/company/{companyId}")
        public ResponseEntity<ApiResponse<List<CompanySubscriptionResponse>>> listByCompany(
                        @PathVariable UUID companyId) {
                return ResponseEntity.ok(ApiResponse.success(useCase.listByCompany(companyId)));
        }

        @Operation(summary = "Subscription active hiện tại của công ty")
        @GetMapping("/company/{companyId}/active")
        public ResponseEntity<ApiResponse<CompanySubscription>> getActive(
                        @PathVariable UUID companyId) {
                return ResponseEntity.ok(ApiResponse.success(useCase.getActive(companyId)));
        }

        @Operation(summary = "Cấp thêm quota đăng bài")
        @PostMapping("/company/{companyId}/grant-quota")
        public ResponseEntity<ApiResponse<CompanySubscription>> grantQuota(
                        @PathVariable UUID companyId,
                        @Valid @RequestBody GrantQuotaRequest req) {
                var sub = useCase.grantJobPostQuota(companyId, req.getAmount(), req.getReason());
                return ResponseEntity.ok(
                                ApiResponse.success(sub, "Đã cấp thêm " + req.getAmount() + " quota đăng bài."));
        }

        @Operation(summary = "Gia hạn subscription thủ công")
        @PostMapping("/company/{companyId}/extend")
        public ResponseEntity<ApiResponse<CompanySubscription>> extend(
                        @PathVariable UUID companyId,
                        @Valid @RequestBody ExtendExpiryRequest req) {
                var sub = useCase.extendExpiry(companyId, req.getDays(), req.getReason());
                return ResponseEntity.ok(
                                ApiResponse.success(sub, "Đã gia hạn thêm " + req.getDays() + " ngày."));
        }

        @Operation(summary = "Thu hồi subscription vi phạm")
        @PostMapping("/company/{companyId}/revoke")
        public ResponseEntity<ApiResponse<CompanySubscription>> revoke(
                        @PathVariable UUID companyId,
                        @Valid @RequestBody ReasonRequest req) {
                var sub = useCase.revoke(companyId, req.getReason());
                return ResponseEntity.ok(ApiResponse.success(sub, "Subscription đã bị thu hồi."));
        }

        @GetMapping("/export/excel")
        public ResponseEntity<byte[]> exportExcel() {
                return exportUseCase.execute(AdminExportCompanySubscriptionsUseCase.Format.EXCEL)
                                .toResponseEntity();
        }

        @GetMapping("/export/pdf")
        public ResponseEntity<byte[]> exportPdf() {
                return exportUseCase.execute(AdminExportCompanySubscriptionsUseCase.Format.PDF)
                                .toResponseEntity();
        }
}