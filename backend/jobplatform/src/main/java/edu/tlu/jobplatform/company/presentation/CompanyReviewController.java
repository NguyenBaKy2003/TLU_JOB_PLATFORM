package edu.tlu.jobplatform.company.presentation;

import edu.tlu.jobplatform.company.application.usecase.ReviewCompanyUseCase;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.presentation.dto.CreateReviewRequest;
import edu.tlu.jobplatform.company.presentation.dto.ReviewResponse;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Endpoints:
 * GET /api/v1/companies/{id}/reviews — Danh sách review (public)
 * POST /api/v1/companies/{id}/reviews — Viết review (CANDIDATE)
 * DELETE /api/v1/companies/{id}/reviews/{rid} — Xóa review (owner/ADMIN)
 * PATCH /api/v1/admin/reviews/{rid}/hide — Admin ẩn review
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Company Review", description = "Đánh giá công ty")
public class CompanyReviewController {

    private final ReviewCompanyUseCase reviewUseCase;
    private final CompanyReviewRepository reviewRepository;

    @Operation(summary = "Danh sách đánh giá của công ty")
    @GetMapping("/api/v1/companies/{companyId}/reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> list(
            @PathVariable UUID companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = reviewRepository.findVisibleByCompanyId(companyId, pageable)
                .map(ReviewResponse::from);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @Operation(summary = "Viết đánh giá công ty")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/api/v1/companies/{companyId}/reviews")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @PathVariable UUID companyId,
            @Valid @RequestBody CreateReviewRequest req) {

        UUID reviewerId = SecurityUtils.getCurrentUserIdOrThrow();
        CompanyReview review = reviewUseCase.create(new ReviewCompanyUseCase.CreateCommand(
                companyId, reviewerId, req.getRating(), req.getTitle(),
                req.getContent(), req.getPros(), req.getCons(),
                req.isAnonymous(), req.isEmployed()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(ReviewResponse.from(review), "Cảm ơn bạn đã đánh giá!"));
    }

    @Operation(summary = "Xóa đánh giá")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/api/v1/companies/{companyId}/reviews/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID companyId,
            @PathVariable UUID reviewId) {

        reviewUseCase.delete(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đánh giá."));
    }

    @Operation(summary = "[ADMIN] Ẩn đánh giá vi phạm")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/api/v1/admin/reviews/{reviewId}/hide")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hide(@PathVariable UUID reviewId) {
        reviewUseCase.hide(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Đánh giá đã bị ẩn."));
    }
}