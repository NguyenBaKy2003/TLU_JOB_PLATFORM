package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.subscription.application.usecase.CheckQuotaUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.PurchasePlanUseCase;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CompanySubscriptionRepository;
import edu.tlu.jobplatform.subscription.domain.repository.SubscriptionPlanRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscription", description = "Quản lý gói dịch vụ tuyển dụng")
public class SubscriptionController {

    private final SubscriptionPlanRepository planRepository;
    private final CompanySubscriptionRepository subscriptionRepository;
    private final PurchasePlanUseCase purchaseUseCase;
    private final CheckQuotaUseCase checkQuotaUseCase;
    private final CompanyRepository companyRepository;

    @Operation(summary = "Danh sách gói dịch vụ (trang pricing)")
    @GetMapping("/plans")
    @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
    public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> getPlans() {
        return ResponseEntity.ok(ApiResponse.success(planRepository.findAllActive()));
    }

    @Operation(summary = "Subscription hiện tại của công ty")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER')")
    @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<?>> getMySubscription() {
        UUID companyId = resolveCompanyId();
        Optional<CompanySubscription> optional = subscriptionRepository
                .findActiveByCompanyId(companyId);

        if (optional.isPresent())
            return ResponseEntity.ok(ApiResponse.success(optional.get()));

        return ResponseEntity.ok(ApiResponse.success("Chưa có gói dịch vụ nào."));
    }

    @Operation(summary = "Thông tin quota còn lại")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/my/quota")
    @PreAuthorize("hasRole('EMPLOYER')")
    @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<CheckQuotaUseCase.Result>> getQuota() {
        UUID companyId = resolveCompanyId();
        return ResponseEntity.ok(ApiResponse.success(checkQuotaUseCase.execute(companyId)));
    }

    @Operation(summary = "Mua gói dịch vụ → nhận payment URL")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/purchase")
    @PreAuthorize("hasRole('EMPLOYER')")
    @RateLimit(policy = "purchase", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "EMPLOYER_PURCHASE_PLAN", resourceType = "CompanySubscription")
    public ResponseEntity<ApiResponse<PurchasePlanUseCase.Result>> purchase(
            @Valid @RequestBody PurchaseRequest req) {

        UUID companyId = resolveCompanyId();
        PurchasePlanUseCase.Result result = purchaseUseCase.execute(
                new PurchasePlanUseCase.Command(companyId, req.planId(), req.yearly()));

        return ResponseEntity.ok(ApiResponse.success(result,
                "Đơn hàng đã được tạo. Vui lòng thanh toán tại URL được cung cấp."));
    }

    // ── Helper ─

    private UUID resolveCompanyId() {
        UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
        return companyRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Bạn chưa có hồ sơ công ty. Vui lòng tạo hồ sơ trước khi tiếp tục.",
                        "COMPANY_PROFILE_NOT_FOUND"))
                .getId();
    }

    public record PurchaseRequest(
            @NotNull(message = "Vui lòng chọn gói dịch vụ") UUID planId,
            boolean yearly) {
    }
}