package edu.tlu.jobplatform.company.presentation;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.presentation.dto.response.ReviewResponse;
import edu.tlu.jobplatform.company.presentation.dto.response.ReviewStatsResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Company Review - Public", description = "API công khai xem đánh giá công ty")
public class PublicReviewController {

        private final CompanyReviewRepository reviewRepository;
        private final CandidateProfileRepository candidateProfileRepository;

        @Operation(summary = "Danh sách đánh giá đã duyệt của công ty")
        @GetMapping
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> list(
                        @PathVariable UUID companyId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                Page<CompanyReview> reviewPage = reviewRepository.findApprovedAndVisibleByCompanyId(companyId,
                                pageable);

                Map<UUID, String> reviewerNames = fetchReviewerNames(reviewPage);

                var result = reviewPage.map(review -> ReviewResponse.from(
                                review, reviewerNames.get(review.getReviewerId())));

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Thống kê chi tiết đánh giá của công ty")
        @GetMapping("/stats")
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<ReviewStatsResponse>> stats(
                        @PathVariable UUID companyId) {

                // Lấy điểm trung bình
                Double avgRating = reviewRepository.getAverageRatingByCompanyId(companyId);

                // Đếm tổng số review approved
                long totalReviews = reviewRepository.countByCompanyIdAndStatus(
                                companyId, ReviewStatus.APPROVED);

                // Đếm số lượng theo từng mức sao
                long fiveStar = reviewRepository.countByCompanyIdAndRatingAndStatus(
                                companyId, 5, ReviewStatus.APPROVED);
                long fourStar = reviewRepository.countByCompanyIdAndRatingAndStatus(
                                companyId, 4, ReviewStatus.APPROVED);
                long threeStar = reviewRepository.countByCompanyIdAndRatingAndStatus(
                                companyId, 3, ReviewStatus.APPROVED);
                long twoStar = reviewRepository.countByCompanyIdAndRatingAndStatus(
                                companyId, 2, ReviewStatus.APPROVED);
                long oneStar = reviewRepository.countByCompanyIdAndRatingAndStatus(
                                companyId, 1, ReviewStatus.APPROVED);

                var stats = ReviewStatsResponse.builder()
                                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                                .totalReviews(totalReviews)
                                .fiveStarCount(fiveStar)
                                .fourStarCount(fourStar)
                                .threeStarCount(threeStar)
                                .twoStarCount(twoStar)
                                .oneStarCount(oneStar)
                                .build();

                return ResponseEntity.ok(ApiResponse.success(stats));
        }

        // ── Helper ────────────────────────────────────────────────────────────

        /**
         * Batch-fetch tên reviewer theo reviewerId — 1 query cho cả page,
         * tránh N+1. Review ẩn danh vẫn được map (ReviewResponse.from sẽ tự
         * trả "Ẩn danh" do logic anonymous).
         */
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
                                                PublicReviewController::buildFullName));
        }

        private static String buildFullName(CandidateProfile profile) {
                String first = profile.getFirstName() != null ? profile.getFirstName() : "";
                String last = profile.getLastName() != null ? profile.getLastName() : "";
                String fullName = (first + " " + last).trim();
                return fullName.isEmpty() ? "Người dùng" : fullName;
        }
}