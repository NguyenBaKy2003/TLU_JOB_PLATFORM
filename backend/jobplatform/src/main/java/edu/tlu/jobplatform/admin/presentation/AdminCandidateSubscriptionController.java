package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.AdminCandidateSubscriptionUseCase;
import edu.tlu.jobplatform.admin.application.usecase.export.AdminExportCandidateSubscriptionsUseCase;
import edu.tlu.jobplatform.admin.presentation.dto.request.ReasonRequest;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * GET /api/v1/admin/candidate-subscriptions — Danh sách tất cả
 * GET /api/v1/admin/candidate-subscriptions/candidate/{id} — Lịch sử theo
 * candidate
 * GET /api/v1/admin/candidate-subscriptions/candidate/{id}/active — Active hiện
 * tại
 * POST /api/v1/admin/candidate-subscriptions/candidate/{id}/revoke — Thu hồi
 * GET /api/v1/admin/candidate-subscriptions/export/excel — Xuất Excel
 * GET /api/v1/admin/candidate-subscriptions/export/pdf — Xuất PDF
 */
@RestController
@RequestMapping("/api/v1/admin/candidate-subscriptions")
@RequiredArgsConstructor
@Tag(name = "Admin - Candidate Subscriptions", description = "Quản lý gói đăng ký Candidate")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminCandidateSubscriptionController {

    private final AdminCandidateSubscriptionUseCase useCase;
    private final AdminExportCandidateSubscriptionsUseCase exportUseCase;

    // ── List ──────────────────────────────────────────────────────────────────

    @Operation(summary = "Danh sách tất cả Candidate subscription")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CandidateSubscription>>> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(useCase.listAll(pageable)));
    }

    @Operation(summary = "Lịch sử subscription theo candidate")
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<ApiResponse<List<CandidateSubscription>>> listByCandidate(
            @PathVariable UUID candidateId) {
        return ResponseEntity.ok(ApiResponse.success(useCase.listByCandidate(candidateId)));
    }

    @Operation(summary = "Subscription active hiện tại của candidate")
    @GetMapping("/candidate/{candidateId}/active")
    public ResponseEntity<ApiResponse<CandidateSubscription>> getActive(
            @PathVariable UUID candidateId) {
        return ResponseEntity.ok(ApiResponse.success(useCase.getActive(candidateId)));
    }

    @Operation(summary = "Thu hồi subscription vi phạm")
    @PostMapping("/candidate/{candidateId}/revoke")
    public ResponseEntity<ApiResponse<CandidateSubscription>> revoke(
            @PathVariable UUID candidateId,
            @Valid @RequestBody ReasonRequest req) {
        var sub = useCase.revoke(candidateId, req.getReason());
        return ResponseEntity.ok(ApiResponse.success(sub, "Subscription đã bị thu hồi."));
    }

    // ── Export ────────────────────────────────────────────────────────────────

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() {
        return exportUseCase.execute(AdminExportCandidateSubscriptionsUseCase.Format.EXCEL)
                .toResponseEntity();
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        return exportUseCase.execute(AdminExportCandidateSubscriptionsUseCase.Format.PDF)
                .toResponseEntity();
    }

}