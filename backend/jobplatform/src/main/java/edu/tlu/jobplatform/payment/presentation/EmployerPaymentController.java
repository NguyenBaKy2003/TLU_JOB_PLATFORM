package edu.tlu.jobplatform.payment.presentation;

import edu.tlu.jobplatform.payment.application.usecase.RetryPaymentUseCase;
import edu.tlu.jobplatform.payment.application.usecase.employer.GetMyPaymentsUseCase;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.presentation.dto.response.PaymentResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * GET /api/v1/payments/my — Danh sách giao dịch (không kèm plan detail)
 * GET /api/v1/payments/my/{id} — Chi tiết kèm SubscriptionSummary
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment (Employer)", description = "Lịch sử thanh toán của công ty")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
public class EmployerPaymentController {

    private final GetMyPaymentsUseCase getMyPaymentsUseCase;
    private final RetryPaymentUseCase retryPaymentUseCase;

    @Operation(summary = "Danh sách giao dịch của công ty tôi")
    @GetMapping("/my")
    @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getMyPayments(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) String gateway,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PaymentResponse> result = getMyPaymentsUseCase
                .listMyPayments(status, gateway, keyword, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @Operation(summary = "Chi tiết giao dịch kèm thông tin gói dịch vụ")
    @GetMapping("/my/{id}")
    @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<PaymentResponse>> getMyPaymentDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                getMyPaymentsUseCase.getMyPaymentDetail(id)));
    }

    @Operation(summary = "Thanh toán lại giao dịch thất bại hoặc hết hạn")
    @PostMapping("/my/{id}/retry")
    @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<RetryPaymentUseCase.Result>> retry(
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
        RetryPaymentUseCase.Result result = retryPaymentUseCase.execute(id, userId, false);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}