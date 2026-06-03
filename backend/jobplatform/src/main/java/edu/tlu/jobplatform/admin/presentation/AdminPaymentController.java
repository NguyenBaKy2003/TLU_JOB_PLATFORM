package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.export.AdminExportInvoiceUseCase;
import edu.tlu.jobplatform.admin.application.usecase.export.AdminExportPaymentsUseCase;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.payment.application.usecase.admin.AdminPaymentUseCase;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.presentation.dto.response.AdminPaymentResponse;
import edu.tlu.jobplatform.payment.presentation.dto.response.PaymentStatsResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Admin quản lý toàn bộ giao dịch thanh toán.
 *
 * GET /api/v1/admin/payments — Search đa điều kiện
 * GET /api/v1/admin/payments/stats — Thống kê doanh thu
 * GET /api/v1/admin/payments/{id} — Chi tiết
 * GET /api/v1/admin/payments/company/{id} — Giao dịch theo công ty
 * GET /api/v1/admin/payments/candidate/{id} — Giao dịch theo ứng viên
 * POST /api/v1/admin/payments/{id}/refund — Hoàn tiền (ADMIN)
 * GET /api/v1/admin/payments/export/excel — Xuất Excel
 * GET /api/v1/admin/payments/export/pdf — Xuất PDF
 * GET /api/v1/admin/payments/{id}/invoice — Xuất hóa đơn PDF
 */
@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
@Tag(name = "Admin - Payments", description = "Quản lý giao dịch thanh toán hệ thống")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminPaymentController {

        private final AdminPaymentUseCase adminPaymentUseCase;
        private final AdminExportPaymentsUseCase exportUseCase;
        private final AdminExportInvoiceUseCase invoiceUseCase;

        // ── Search ────────────────────────────────────────────────────────────────

        @Operation(summary = "Tìm kiếm giao dịch — lọc theo companyId, candidateId, status, gateway, ngày")
        @GetMapping
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<AdminPaymentResponse>>> search(
                        @RequestParam(required = false) UUID companyId,
                        @RequestParam(required = false) UUID candidateId,
                        @RequestParam(required = false) PaymentStatus status,
                        @RequestParam(required = false) String gateway,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = adminPaymentUseCase.search(
                                companyId, candidateId, status, gateway, fromDate, toDate, pageable);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        // ── Stats ─────────────────────────────────────────────────────────────────

        @Operation(summary = "Thống kê doanh thu — mặc định 30 ngày gần nhất")
        @GetMapping("/stats")
        @RateLimit(policy = "analytics-admin", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PaymentStatsResponse>> getStats(
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

                LocalDateTime start = from != null ? from : LocalDateTime.now().minusDays(30);
                LocalDateTime end = to != null ? to : LocalDateTime.now();

                AdminPaymentUseCase.Stats stats = adminPaymentUseCase.getStats(start, end);

                return ResponseEntity.ok(ApiResponse.success(
                                PaymentStatsResponse.of(
                                                stats.totalRevenue(),
                                                stats.pendingCount() + stats.successCount() + stats.failedCount(),
                                                stats.pendingCount(), stats.successCount(), stats.failedCount(),
                                                stats.from(), stats.to())));
        }

        // ── Get by ID ─────────────────────────────────────────────────────────────

        @Operation(summary = "Chi tiết giao dịch — bao gồm tên người thanh toán")
        @GetMapping("/{id}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<AdminPaymentResponse>> getById(@PathVariable UUID id) {
                return ResponseEntity.ok(
                                ApiResponse.success(adminPaymentUseCase.getEnrichedById(id)));
        }

        // ── Get by Company ────────────────────────────────────────────────────────

        @Operation(summary = "Tất cả giao dịch của 1 công ty")
        @GetMapping("/company/{companyId}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<AdminPaymentResponse>>> getByCompany(
                        @PathVariable UUID companyId,
                        @RequestParam(required = false) PaymentStatus status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = adminPaymentUseCase.getByCompany(companyId, status, pageable);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        // ── Get by Candidate ──────────────────────────────────────────────────────

        @Operation(summary = "Tất cả giao dịch của 1 ứng viên")
        @GetMapping("/candidate/{candidateId}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<AdminPaymentResponse>>> getByCandidate(
                        @PathVariable UUID candidateId,
                        @RequestParam(required = false) PaymentStatus status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = adminPaymentUseCase.getByCandidate(candidateId, status, pageable);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        // ── Refund ────────────────────────────────────────────────────────────────

        @Operation(summary = "Hoàn tiền giao dịch — chỉ ADMIN")
        @PostMapping("/{id}/refund")
        @RateLimit(policy = "admin-sensitive", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_REFUND_PAYMENT", resourceType = "Payment")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<AdminPaymentResponse>> refund(
                        @PathVariable UUID id,
                        @RequestParam @NotBlank String reason) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                adminPaymentUseCase.refund(id, reason),
                                                "Giao dịch đã được đánh dấu hoàn tiền."));
        }

        // ── Export Excel ──────────────────────────────────────────────────────────

        @Operation(summary = "Xuất danh sách giao dịch ra Excel")
        @GetMapping("/export/excel")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<byte[]> exportExcel(
                        @RequestParam(required = false) UUID companyId,
                        @RequestParam(required = false) UUID candidateId,
                        @RequestParam(required = false) PaymentStatus status,
                        @RequestParam(required = false) String gateway,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {

                var cmd = new AdminExportPaymentsUseCase.Command(
                                companyId, candidateId, status, gateway, fromDate, toDate);
                return exportUseCase.execute(cmd, AdminExportPaymentsUseCase.Format.EXCEL).toResponseEntity();
        }

        // ── Export PDF ────────────────────────────────────────────────────────────

        @Operation(summary = "Xuất danh sách giao dịch ra PDF")
        @GetMapping("/export/pdf")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<byte[]> exportPdf(
                        @RequestParam(required = false) UUID companyId,
                        @RequestParam(required = false) UUID candidateId,
                        @RequestParam(required = false) PaymentStatus status,
                        @RequestParam(required = false) String gateway,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {

                var cmd = new AdminExportPaymentsUseCase.Command(
                                companyId, candidateId, status, gateway, fromDate, toDate);
                return exportUseCase.execute(cmd, AdminExportPaymentsUseCase.Format.PDF).toResponseEntity();
        }

        // ── Invoice ───────────────────────────────────────────────────────────────

        @Operation(summary = "Xuất hóa đơn PDF cho 1 giao dịch")
        @GetMapping("/{id}/invoice")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<byte[]> exportInvoice(@PathVariable UUID id) {
                return invoiceUseCase.execute(id).toResponseEntity();
        }
}