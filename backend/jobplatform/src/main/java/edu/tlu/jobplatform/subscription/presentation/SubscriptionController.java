package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.subscription.application.usecase.GetAvailablePlansUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.PurchasePlanUseCase;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller: Quản lý subscription — mua gói, xem danh sách gói.
 *
 * Endpoints:
 * GET /api/v1/subscriptions/plans — Public: Xem danh sách gói dịch vụ
 * POST /api/v1/subscriptions/purchase — COMPANY: Mua gói dịch vụ
 */
@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscription", description = "Quản lý gói dịch vụ tuyển dụng")
public class SubscriptionController {

    private final GetAvailablePlansUseCase getAvailablePlansUseCase;
    private final PurchasePlanUseCase purchasePlanUseCase;

    /**
     * GET /api/v1/subscriptions/plans
     * Public — không cần auth.
     * Trả về tất cả gói dịch vụ đang active để hiển thị trang pricing.
     */
    @GetMapping("/plans")
    @Operation(summary = "Lấy danh sách gói dịch vụ", description = "Public endpoint — hiển thị trang pricing")
    public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> getAvailablePlans() {
        List<SubscriptionPlan> plans = getAvailablePlansUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    /**
     * POST /api/v1/subscriptions/purchase
     * Chỉ dành cho COMPANY role.
     * Tạo payment và trả về URL redirect đến cổng thanh toán.
     *
     * Request body:
     * {
     * "planId": "uuid",
     * "yearly": false
     * }
     *
     * Response:
     * {
     * "paymentId": "uuid",
     * "subscriptionId": "uuid",
     * "paymentUrl": "https://sandbox.vnpayment.vn/...",
     * "orderCode": "JP-A1B2C3D4"
     * }
     */
    @PostMapping("/purchase")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Mua gói dịch vụ", description = "Tạo đơn hàng và trả về URL thanh toán VNPAY/MOMO")
    public ResponseEntity<ApiResponse<PurchasePlanUseCase.Result>> purchasePlan(
            @AuthenticationPrincipal UUID companyId,
            @RequestBody PurchaseRequest request) {

        PurchasePlanUseCase.Command cmd = new PurchasePlanUseCase.Command(
                companyId, request.planId(), request.yearly());

        PurchasePlanUseCase.Result result = purchasePlanUseCase.execute(cmd);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    public record PurchaseRequest(UUID planId, boolean yearly) {
    }
}
