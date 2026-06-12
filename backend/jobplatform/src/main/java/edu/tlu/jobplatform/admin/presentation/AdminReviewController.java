package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.export.AdminExportReviewsUseCase;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.application.usecase.*;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.presentation.dto.request.RejectReviewRequest;
import edu.tlu.jobplatform.company.presentation.dto.response.ReviewResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
@Tag(name = "Company Review - Admin", description = "API quản trị đánh giá cho Admin/Super Admin")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminReviewController {

        private final ApproveReviewUseCase approveReviewUseCase;
        private final RejectReviewUseCase rejectReviewUseCase;
        private final ModerateReviewUseCase moderateReviewUseCase;
        private final DeleteReviewUseCase deleteReviewUseCase;
        private final GetReviewUseCase getReviewUseCase;
        private final CompanyReviewRepository reviewRepository;
        private final AdminExportReviewsUseCase exportUseCase;
        private final CandidateProfileRepository candidateProfileRepository;

        @Operation(summary = "Xem tất cả review chờ duyệt")
        @GetMapping("/pending")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getPendingReviews(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = reviewRepository.findByStatus(ReviewStatus.PENDING, pageable)
                                .map(review -> {
                                        String name = review.isAnonymous()
                                                        ? "Ẩn danh"
                                                        : candidateProfileRepository
                                                                        .findByUserId(review.getReviewerId())
                                                                        .map(p -> (p.getFirstName() + " "
                                                                                        + p.getLastName()).trim())
                                                                        .orElse("Người dùng ẩn danh");
                                        return ReviewResponse.from(review, name);
                                });
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Xem tất cả review (có thể lọc theo status)")
        @GetMapping
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getAllReviews(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) ReviewStatus status) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = reviewRepository.findByStatus(status, pageable)
                                .map(review -> {
                                        String name = review.isAnonymous()
                                                        ? "Ẩn danh"
                                                        : candidateProfileRepository
                                                                        .findByUserId(review.getReviewerId())
                                                                        .map(p -> (p.getFirstName() + " "
                                                                                        + p.getLastName()).trim())
                                                                        .orElse("Người dùng ẩn danh");
                                        return ReviewResponse.from(review, name);
                                });

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Xem chi tiết review")
        @GetMapping("/{reviewId}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<ReviewResponse>> getDetail(
                        @PathVariable UUID reviewId) {

                CompanyReview review = getReviewUseCase.byId(reviewId);
                String name = review.isAnonymous()
                                ? "Ẩn danh"
                                : candidateProfileRepository.findByUserId(review.getReviewerId())
                                                .map(p -> (p.getFirstName() + " " + p.getLastName()).trim())
                                                .orElse("Người dùng ẩn danh");

                return ResponseEntity.ok(ApiResponse.success(ReviewResponse.from(review, name)));
        }

        @Operation(summary = "Duyệt review")
        @PostMapping("/{reviewId}/approve")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_APPROVE_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<ReviewResponse>> approve(
                        @PathVariable UUID reviewId) {

                UUID adminId = SecurityUtils.getCurrentUserIdOrThrow();
                var cmd = ApproveReviewUseCase.Command.builder()
                                .reviewId(reviewId)
                                .approverId(adminId)
                                .build();

                CompanyReview review = approveReviewUseCase.execute(cmd);

                return ResponseEntity.ok(ApiResponse.success(ReviewResponse.from(review),
                                "Đã duyệt đánh giá thành công!"));
        }

        @Operation(summary = "Từ chối review")
        @PutMapping("/{reviewId}/reject")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_REJECT_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<ReviewResponse>> reject(
                        @PathVariable UUID reviewId,
                        @Valid @RequestBody RejectReviewRequest req) {

                UUID adminId = SecurityUtils.getCurrentUserIdOrThrow();
                var cmd = RejectReviewUseCase.Command.builder()
                                .reviewId(reviewId)
                                .reviewerId(adminId)
                                .reason(req.getReason())
                                .build();

                CompanyReview review = rejectReviewUseCase.execute(cmd);

                return ResponseEntity.ok(ApiResponse.success(ReviewResponse.from(review),
                                "Đã từ chối đánh giá!"));
        }

        @Operation(summary = "Ẩn đánh giá vi phạm")
        @PatchMapping("/{reviewId}/hide")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_HIDE_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<Void>> hide(@PathVariable UUID reviewId) {
                moderateReviewUseCase.hide(reviewId);
                return ResponseEntity.ok(ApiResponse.success(null, "Đánh giá đã bị ẩn."));
        }

        @Operation(summary = "Hiển thị lại đánh giá")
        @PatchMapping("/{reviewId}/show")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_SHOW_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<Void>> show(@PathVariable UUID reviewId) {
                moderateReviewUseCase.show(reviewId);
                return ResponseEntity.ok(ApiResponse.success(null, "Đánh giá đã được hiển thị lại."));
        }

        @Operation(summary = "Xóa đánh giá")
        @DeleteMapping("/{reviewId}")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_DELETE_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID reviewId) {
                deleteReviewUseCase.deleteByAdmin(reviewId);
                return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa đánh giá."));
        }

        @Operation(summary = "Xuất danh sách đánh giá ra Excel")
        @GetMapping("/export/excel")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<byte[]> exportExcel(
                        @RequestParam(required = false) ReviewStatus status) {

                var cmd = new AdminExportReviewsUseCase.Command(status);
                return exportUseCase.execute(cmd, AdminExportReviewsUseCase.Format.EXCEL)
                                .toResponseEntity();
        }

        @Operation(summary = "Xuất danh sách đánh giá ra PDF")
        @GetMapping("/export/pdf")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<byte[]> exportPdf(
                        @RequestParam(required = false) ReviewStatus status) {

                var cmd = new AdminExportReviewsUseCase.Command(status);
                return exportUseCase.execute(cmd, AdminExportReviewsUseCase.Format.PDF)
                                .toResponseEntity();
        }
}