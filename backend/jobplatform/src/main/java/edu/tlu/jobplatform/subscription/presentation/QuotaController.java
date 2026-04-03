package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.subscription.application.usecase.CheckQuotaUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.ConsumeQuotaUseCase;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller: Kiểm tra và tiêu thụ quota gói dịch vụ.
 *
 * Endpoints:
 * GET /api/v1/subscriptions/quota — EMPLOYER: Xem trạng thái quota hiện tại
 * POST /api/v1/subscriptions/quota/consume/{type} — INTERNAL/EMPLOYER: Tiêu thụ
 * 1 đơn vị quota
 *
 * Lưu ý: /consume thường được gọi nội bộ từ Job domain sau khi đăng tin thành
 * công.
 * Nếu dùng microservice, endpoint này có thể bảo vệ bằng service token (M2M).
 */
@RestController
@RequestMapping("/api/v1/subscriptions/quota")
@RequiredArgsConstructor
@Tag(name = "Quota", description = "Kiểm tra và tiêu thụ quota gói dịch vụ")
public class QuotaController {

    private final CheckQuotaUseCase checkQuotaUseCase;
    private final ConsumeQuotaUseCase consumeQuotaUseCase;

    /**
     * GET /api/v1/subscriptions/quota
     *
     * Trả về trạng thái quota hiện tại của công ty đang đăng nhập.
     * Dùng để hiển thị dashboard: còn bao nhiêu tin, hết hạn khi nào.
     *
     * Response:
     * {
     * "hasActiveSubscription": true,
     * "canPostJob": true,
     * "canPostFeatured": false,
     * "jobsRemaining": 12,
     * "daysLeft": 18,
     * "planCode": "BUSINESS"
     * }
     */
    @GetMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Xem trạng thái quota", description = "Kiểm tra quota còn lại của công ty hiện tại")
    public ResponseEntity<ApiResponse<CheckQuotaUseCase.Result>> getQuotaStatus(
            @AuthenticationPrincipal UUID companyId) {

        CheckQuotaUseCase.Result result = checkQuotaUseCase.execute(companyId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/v1/subscriptions/quota/company/{companyId}
     *
     * Cho phép ADMIN xem quota của một công ty bất kỳ.
     * Hoặc dùng cho internal service call (Job domain gọi sang).
     */
    @GetMapping("/company/{companyId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SERVICE')")
    @Operation(summary = "Xem quota của công ty (Admin/Internal)", description = "Admin hoặc internal service kiểm tra quota của bất kỳ công ty nào")
    public ResponseEntity<ApiResponse<CheckQuotaUseCase.Result>> getQuotaByCompany(
            @PathVariable UUID companyId) {

        CheckQuotaUseCase.Result result = checkQuotaUseCase.execute(companyId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * POST /api/v1/subscriptions/quota/consume/{type}
     *
     * Tiêu thụ 1 đơn vị quota của loại được chỉ định.
     * Gọi sau khi hành động tương ứng đã thành công (đăng tin, xem CV...).
     *
     * Path variable {type}: JOB_POST | FEATURED_JOB | CV_VIEW
     *
     * Endpoint này dành cho:
     * - Internal service-to-service call (Job domain → Subscription domain)
     * - Hoặc EMPLOYER tự gọi nếu dùng monolith
     *
     * Nếu không đủ quota → 422 Unprocessable Entity với error code quota tương ứng.
     */
    @PostMapping("/consume/{type}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('SERVICE')")
    @Operation(summary = "Tiêu thụ quota", description = "Trừ 1 đơn vị quota sau khi hành động thành công")
    public ResponseEntity<ApiResponse<Void>> consumeQuota(
            @AuthenticationPrincipal UUID companyId,
            @PathVariable ConsumeQuotaUseCase.QuotaType type) {

        consumeQuotaUseCase.execute(companyId, type);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * POST /api/v1/subscriptions/quota/consume/{type}/company/{companyId}
     *
     * Variant cho internal service: Job domain gọi với companyId explicit.
     * Dùng khi caller không có JWT của công ty (M2M flow).
     */
    @PostMapping("/consume/{type}/company/{companyId}")
    @PreAuthorize("hasRole('SERVICE')")
    @Operation(summary = "Tiêu thụ quota (Internal M2M)", description = "Internal service-to-service: tiêu thụ quota với companyId tường minh")
    public ResponseEntity<ApiResponse<Void>> consumeQuotaInternal(
            @PathVariable ConsumeQuotaUseCase.QuotaType type,
            @PathVariable UUID companyId) {

        consumeQuotaUseCase.execute(companyId, type);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
