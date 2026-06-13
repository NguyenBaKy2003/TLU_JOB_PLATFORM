package edu.tlu.jobplatform.company.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.application.usecase.ApproveReviewUseCase;
import edu.tlu.jobplatform.company.application.usecase.RejectReviewUseCase;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.presentation.dto.request.RejectReviewRequest;
import edu.tlu.jobplatform.company.presentation.dto.response.ReviewResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/company/reviews")
@RequiredArgsConstructor
@Tag(name = "Company Review - Management", description = "API quản lý đánh giá cho Employer")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('EMPLOYER')")
public class CompanyReviewManagementController {

        private final ApproveReviewUseCase approveReviewUseCase;
        private final RejectReviewUseCase rejectReviewUseCase;
        private final CompanyReviewRepository reviewRepository;
        private final CompanyRepository companyRepository;
        private final CandidateProfileRepository candidateProfileRepository;

        @Operation(summary = "Xem review chờ duyệt của công ty mình")
        @GetMapping("/pending")
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getPendingReviews(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                UUID companyId = resolveCompanyId();
                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

                Page<CompanyReview> reviewPage = reviewRepository
                                .findByCompanyIdAndStatus(companyId, ReviewStatus.PENDING, pageable);

                Map<UUID, String> reviewerNames = fetchReviewerNames(reviewPage);

                var result = reviewPage.map(review -> ReviewResponse.from(
                                review, reviewerNames.get(review.getReviewerId())));

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Xem tất cả review của công ty mình")
        @GetMapping
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getAllReviews(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) ReviewStatus status) {

                UUID companyId = resolveCompanyId();
                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

                Page<CompanyReview> reviewPage = status != null
                                ? reviewRepository.findByCompanyIdAndStatus(companyId, status, pageable)
                                : reviewRepository.findAllByCompanyId(companyId, pageable);

                Map<UUID, String> reviewerNames = fetchReviewerNames(reviewPage);

                var result = reviewPage.map(review -> ReviewResponse.from(
                                review, reviewerNames.get(review.getReviewerId())));

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Duyệt review")
        @PutMapping("/{reviewId}/approve")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_APPROVE_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<ReviewResponse>> approve(
                        @CurrentUser UUID userId,
                        @PathVariable UUID reviewId) {

                UUID companyId = resolveCompanyId();
                verifyReviewOwnership(reviewId, companyId, "duyệt");

                var cmd = ApproveReviewUseCase.Command.builder()
                                .reviewId(reviewId)
                                .approverId(userId)
                                .build();

                CompanyReview approvedReview = approveReviewUseCase.execute(cmd);
                return ResponseEntity.ok(ApiResponse.success(
                                ReviewResponse.from(approvedReview), "Đã duyệt đánh giá thành công!"));
        }

        @Operation(summary = "Từ chối review")
        @PutMapping("/{reviewId}/reject")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_REJECT_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<ReviewResponse>> reject(
                        @CurrentUser UUID userId,
                        @PathVariable UUID reviewId,
                        @Valid @RequestBody RejectReviewRequest req) {

                UUID companyId = resolveCompanyId();
                verifyReviewOwnership(reviewId, companyId, "từ chối");

                var cmd = RejectReviewUseCase.Command.builder()
                                .reviewId(reviewId)
                                .reviewerId(userId)
                                .reason(req.getReason())
                                .build();

                CompanyReview rejectedReview = rejectReviewUseCase.execute(cmd);
                return ResponseEntity.ok(ApiResponse.success(
                                ReviewResponse.from(rejectedReview), "Đã từ chối đánh giá!"));
        }

        // ── Helpers ───────────────────────────────────────────────────────────────

        /**
         * Lấy companyId từ userId trong Security Context — giống JobPostController.
         */
        private UUID resolveCompanyId() {
                UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
                return companyRepository.findByOwnerId(ownerId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Bạn chưa có hồ sơ công ty. Vui lòng tạo hồ sơ trước.",
                                                "COMPANY_PROFILE_NOT_FOUND"))
                                .getId();
        }

        /**
         * Kiểm tra review thuộc về công ty của người dùng hiện tại.
         * Tách ra helper để tránh lặp code giữa approve và reject.
         */
        private void verifyReviewOwnership(UUID reviewId, UUID companyId, String action) {
                CompanyReview review = reviewRepository.findById(reviewId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy đánh giá.", "REVIEW_NOT_FOUND"));

                if (!review.getCompanyId().equals(companyId)) {
                        throw new BusinessRuleException(
                                        "Bạn không có quyền " + action + " đánh giá này.", "FORBIDDEN");
                }
        }

        private Map<UUID, String> fetchReviewerNames(Page<CompanyReview> reviewPage) {
                Set<UUID> reviewerIds = reviewPage.getContent().stream()
                                .map(CompanyReview::getReviewerId)
                                .filter(java.util.Objects::nonNull)
                                .collect(Collectors.toSet());

                if (reviewerIds.isEmpty()) {
                        return Map.of();
                }

                return candidateProfileRepository.findAllByUserId(reviewerIds).stream()
                                .collect(Collectors.toMap(
                                                CandidateProfile::getUserId,
                                                CompanyReviewManagementController::buildFullName));
        }

        private static String buildFullName(CandidateProfile profile) {
                String first = profile.getFirstName() != null ? profile.getFirstName() : "";
                String last = profile.getLastName() != null ? profile.getLastName() : "";
                String fullName = (first + " " + last).trim();
                return fullName.isEmpty() ? "Người dùng" : fullName;
        }
}