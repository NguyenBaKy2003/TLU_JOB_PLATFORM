package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.subscription.application.usecase.*;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import edu.tlu.jobplatform.subscription.presentation.dto.request.CandidatePurchaseRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * REST Controller: Candidate quản lý gói dịch vụ của mình.
 *
 * Base path: /api/v1/subscriptions/candidate
 *
 * Endpoints:
 * GET /plans — Danh sách gói (public, pricing page)
 * GET /my — Subscription hiện tại (CANDIDATE only)
 * GET /my/quota — Quota còn lại (CANDIDATE only)
 * POST /purchase — Mua gói, nhận payment URL (CANDIDATE only)
 */
@RestController
@RequestMapping("/api/v1/subscriptions/candidate")
@RequiredArgsConstructor
@Tag(name = "Candidate Subscription", description = "Gói dịch vụ dành cho Ứng viên")
public class CandidateSubscriptionController {

    private final GetCandidatePlansUseCase getPlansUseCase;
    private final PurchaseCandidatePlanUseCase purchaseUseCase;
    private final CheckCandidateQuotaUseCase checkQuotaUseCase;
    private final CandidateSubscriptionRepository subscriptionRepository;

    // ── GET /plans ────────────────────────────────────────────────────

    @Operation(summary = "Danh sách gói dịch vụ Candidate (pricing page)")
    @GetMapping("/plans")
    @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
    public ResponseEntity<ApiResponse<List<CandidateSubscriptionPlan>>> getPlans() {
        return ResponseEntity.ok(ApiResponse.success(getPlansUseCase.execute()));
    }

    // ── GET /my ───────────────────────────────────────────────────────

    @Operation(summary = "Subscription hiện tại của Candidate")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @RateLimit(policy = "candidate-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<?>> getMy() {
        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
        Optional<CandidateSubscription> optional = subscriptionRepository.findActiveByCandidate(candidateId);

        if (optional.isPresent())
            return ResponseEntity.ok(ApiResponse.success(optional.get()));

        return ResponseEntity.ok(ApiResponse.success("Bạn chưa có gói dịch vụ nào."));
    }

    // ── GET /my/quota ─────────────────────────────────────────────────

    @Operation(summary = "Quota còn lại của Candidate")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/my/quota")
    @PreAuthorize("hasRole('CANDIDATE')")
    @RateLimit(policy = "candidate-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<CheckCandidateQuotaUseCase.Result>> getQuota() {
        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(checkQuotaUseCase.execute(candidateId)));
    }

    // ── POST /purchase ────────────────────────────────────────────────

    @Operation(summary = "Mua gói dịch vụ Candidate → nhận payment URL")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/purchase")
    @PreAuthorize("hasRole('CANDIDATE')")
    @RateLimit(policy = "purchase", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "CANDIDATE_PURCHASE_PLAN", resourceType = "CandidateSubscription")
    public ResponseEntity<ApiResponse<PurchaseCandidatePlanUseCase.Result>> purchase(
            @Valid @RequestBody CandidatePurchaseRequest req) {

        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

        PurchaseCandidatePlanUseCase.Result result = purchaseUseCase.execute(
                new PurchaseCandidatePlanUseCase.Command(
                        candidateId, req.planId(), req.yearly()));

        return ResponseEntity.ok(ApiResponse.success(result,
                "Đơn hàng đã được tạo. Vui lòng thanh toán tại URL được cung cấp."));
    }
}