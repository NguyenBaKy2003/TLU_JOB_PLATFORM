package edu.tlu.jobplatform.company.presentation;

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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Company Review - Public", description = "API công khai xem đánh giá công ty")
public class PublicReviewController {

        private final CompanyReviewRepository reviewRepository;

        @Operation(summary = "Danh sách đánh giá đã duyệt của công ty")
        @GetMapping
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> list(
                        @PathVariable UUID companyId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = reviewRepository.findApprovedAndVisibleByCompanyId(companyId, pageable)
                                .map(ReviewResponse::from);

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
}