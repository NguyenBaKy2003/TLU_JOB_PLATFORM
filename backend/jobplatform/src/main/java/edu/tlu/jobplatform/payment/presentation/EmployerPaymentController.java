package edu.tlu.jobplatform.payment.presentation;

import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.presentation.dto.response.PaymentResponse;
import edu.tlu.jobplatform.payment.usecase.employer.GetMyPaymentsUseCase;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * GET /api/v1/payments/my — Lịch sử thanh toán (có filter status)
 * GET /api/v1/payments/my/{id} — Chi tiết giao dịch
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment (Employer)", description = "Lịch sử thanh toán của công ty")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
public class EmployerPaymentController {

    private final GetMyPaymentsUseCase getMyPaymentsUseCase;

    @Operation(summary = "Lịch sử thanh toán của công ty tôi")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getMyPayments(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = getMyPaymentsUseCase.listMyPayments(status, pageable)
                .map(PaymentResponse::from);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @Operation(summary = "Chi tiết giao dịch thanh toán")
    @GetMapping("/my/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getMyPaymentDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                PaymentResponse.from(getMyPaymentsUseCase.getMyPaymentDetail(id))));
    }
}
