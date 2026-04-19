package edu.tlu.jobplatform.payment.presentation;

import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.presentation.dto.response.PaymentResponse;
import edu.tlu.jobplatform.payment.presentation.dto.response.PaymentStatsResponse;
import edu.tlu.jobplatform.payment.usecase.admin.AdminPaymentUseCase;
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
 * GET /api/v1/admin/payments/company/{companyId} — Giao dịch theo công ty
 * POST /api/v1/admin/payments/{id}/refund — Hoàn tiền (SUPER_ADMIN)
 */
@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
@Tag(name = "Admin - Payments", description = "Quản lý giao dịch thanh toán hệ thống")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminPaymentController {

        private final AdminPaymentUseCase adminPaymentUseCase;

        @Operation(summary = "Tìm kiếm giao dịch — lọc theo công ty, status, gateway, ngày")
        @GetMapping
        public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> search(
                        @RequestParam(required = false) UUID companyId,
                        @RequestParam(required = false) PaymentStatus status,
                        @RequestParam(required = false) String gateway,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = adminPaymentUseCase
                                .search(companyId, status, gateway, fromDate, toDate, pageable)
                                .map(PaymentResponse::from);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Thống kê doanh thu — mặc định 30 ngày gần nhất")
        @GetMapping("/stats")
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

        @Operation(summary = "Chi tiết giao dịch")
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<PaymentResponse>> getById(@PathVariable UUID id) {
                return ResponseEntity.ok(
                                ApiResponse.success(PaymentResponse.from(adminPaymentUseCase.getById(id))));
        }

        @Operation(summary = "Tất cả giao dịch của 1 công ty")
        @GetMapping("/company/{companyId}")
        public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getByCompany(
                        @PathVariable UUID companyId,
                        @RequestParam(required = false) PaymentStatus status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = adminPaymentUseCase.getByCompany(companyId, status, pageable)
                                .map(PaymentResponse::from);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Hoàn tiền giao dịch — chỉ ADMIN")
        @PostMapping("/{id}/refund")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<PaymentResponse>> refund(
                        @PathVariable UUID id,
                        @RequestParam @NotBlank String reason) {

                var payment = adminPaymentUseCase.refund(id, reason);
                return ResponseEntity.ok(
                                ApiResponse.success(PaymentResponse.from(payment),
                                                "Giao dịch đã được đánh dấu hoàn tiền."));
        }
}
