package edu.tlu.jobplatform.company.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.company.application.usecase.CreateReviewUseCase;
import edu.tlu.jobplatform.company.application.usecase.DeleteReviewUseCase;
import edu.tlu.jobplatform.company.application.usecase.GetMyReviewsUseCase;
import edu.tlu.jobplatform.company.application.usecase.UpdateReviewUseCase;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.presentation.dto.request.CreateReviewRequest;
import edu.tlu.jobplatform.company.presentation.dto.request.UpdateReviewRequest;
import edu.tlu.jobplatform.company.presentation.dto.response.ReviewResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Company Review - Candidate", description = "API ứng viên quản lý đánh giá của mình")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateReviewController {

        private final CreateReviewUseCase createReviewUseCase;
        private final UpdateReviewUseCase updateReviewUseCase;
        private final DeleteReviewUseCase deleteReviewUseCase;
        private final GetMyReviewsUseCase getMyReviewsUseCase;

        @Operation(summary = "Viết đánh giá công ty")
        @PostMapping("/api/v1/companies/{companyId}/reviews")
        @RateLimit(policy = "review-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_CREATE_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<ReviewResponse>> create(
                        @PathVariable UUID companyId,
                        @Valid @RequestBody CreateReviewRequest req) {

                UUID reviewerId = SecurityUtils.getCurrentUserIdOrThrow();
                var cmd = CreateReviewUseCase.Command.builder()
                                .companyId(companyId)
                                .reviewerId(reviewerId)
                                .rating(req.getRating())
                                .title(req.getTitle())
                                .content(req.getContent())
                                .pros(req.getPros())
                                .cons(req.getCons())
                                .anonymous(req.isAnonymous())
                                .employed(req.isEmployed())
                                .build();

                CompanyReview review = createReviewUseCase.execute(cmd);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(ReviewResponse.from(review),
                                                "Đánh giá của bạn đã được gửi và đang chờ duyệt!"));
        }

        @Operation(summary = "Cập nhật đánh giá của mình")
        @PutMapping("/api/v1/companies/{companyId}/reviews/{reviewId}")
        @RateLimit(policy = "review-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_UPDATE_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<ReviewResponse>> update(
                        @PathVariable UUID companyId,
                        @PathVariable UUID reviewId,
                        @Valid @RequestBody UpdateReviewRequest req) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                var cmd = UpdateReviewUseCase.Command.builder()
                                .reviewId(reviewId)
                                .userId(userId)
                                .rating(req.getRating())
                                .title(req.getTitle())
                                .content(req.getContent())
                                .pros(req.getPros())
                                .cons(req.getCons())
                                .build();

                CompanyReview review = updateReviewUseCase.execute(cmd);

                return ResponseEntity.ok(ApiResponse.success(ReviewResponse.from(review),
                                "Đánh giá đã được cập nhật và đang chờ duyệt lại!"));
        }

        @Operation(summary = "Xóa đánh giá của mình")
        @DeleteMapping("/api/v1/companies/{companyId}/reviews/{reviewId}")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_DELETE_REVIEW", resourceType = "CompanyReview")
        public ResponseEntity<ApiResponse<Void>> delete(
                        @PathVariable UUID companyId,
                        @PathVariable UUID reviewId) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                deleteReviewUseCase.deleteByOwner(reviewId, userId);
                return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa đánh giá."));
        }

        @Operation(summary = "Xem danh sách đánh giá của tôi")
        @GetMapping("/api/v1/my-reviews")
        @RateLimit(policy = "candidate-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<GetMyReviewsUseCase.Result>> getMyReviews(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "12") int size,
                        @RequestParam(required = false) ReviewStatus status,
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAtFrom,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAtTo) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();

                var result = getMyReviewsUseCase.execute(
                                GetMyReviewsUseCase.Query.builder()
                                                .reviewerId(userId)
                                                .status(status)
                                                .keyword(keyword)
                                                .createdAtFrom(createdAtFrom != null ? createdAtFrom.atStartOfDay()
                                                                : null)
                                                .createdAtTo(createdAtTo != null ? createdAtTo.atTime(LocalTime.MAX)
                                                                : null)
                                                .page(page)
                                                .size(size)
                                                .build());

                return ResponseEntity.ok(ApiResponse.success(result));
        }
}