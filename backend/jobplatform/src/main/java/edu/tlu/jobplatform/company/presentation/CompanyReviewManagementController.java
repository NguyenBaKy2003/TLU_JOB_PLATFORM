package edu.tlu.jobplatform.company.presentation;

import edu.tlu.jobplatform.company.application.usecase.ApproveReviewUseCase;
import edu.tlu.jobplatform.company.application.usecase.RejectReviewUseCase;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.presentation.dto.request.RejectReviewRequest;
import edu.tlu.jobplatform.company.presentation.dto.response.ReviewResponse;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
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

/**
 * Company Review Management Controller
 * 
 * Xử lý các thao tác quản lý review cho Employer (Company Admin/Manager).
 * 
 * Quy tắc:
 * - Lấy userId từ token (CurrentUser)
 * - Lấy companyId từ userId thông qua CompanyRepository (resolveCompanyId)
 * - Kiểm tra review thuộc về công ty của mình trước khi duyệt/từ chối
 */
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

        @Operation(summary = "Xem review chờ duyệt của công ty mình")
        @GetMapping("/pending")
        public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getPendingReviews(
                        @CurrentUser UUID userId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                UUID companyId = resolveCompanyId(userId);
                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

                var result = reviewRepository.findByCompanyIdAndStatus(
                                companyId, ReviewStatus.PENDING, pageable)
                                .map(ReviewResponse::from);

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Xem tất cả review của công ty mình")
        @GetMapping
        public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getAllReviews(
                        @CurrentUser UUID userId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) ReviewStatus status) {

                UUID companyId = resolveCompanyId(userId);
                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

                var result = status != null
                                ? reviewRepository.findByCompanyIdAndStatus(companyId, status, pageable)
                                : reviewRepository.findAllByCompanyId(companyId, pageable);

                return ResponseEntity.ok(ApiResponse.success(
                                PageResponse.from(result.map(ReviewResponse::from))));
        }

        @Operation(summary = "Duyệt review")
        @PutMapping("/{reviewId}/approve")
        public ResponseEntity<ApiResponse<ReviewResponse>> approve(
                        @CurrentUser UUID userId,
                        @PathVariable UUID reviewId) {

                UUID companyId = resolveCompanyId(userId);

                // Kiểm tra review thuộc về công ty của mình
                CompanyReview review = reviewRepository.findById(reviewId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy đánh giá.", "REVIEW_NOT_FOUND"));

                if (!review.getCompanyId().equals(companyId)) {
                        throw new BusinessRuleException(
                                        "Bạn không có quyền duyệt đánh giá này.", "FORBIDDEN");
                }

                var cmd = ApproveReviewUseCase.Command.builder()
                                .reviewId(reviewId)
                                .approverId(userId)
                                .build();

                CompanyReview approvedReview = approveReviewUseCase.execute(cmd);

                return ResponseEntity.ok(ApiResponse.success(ReviewResponse.from(approvedReview),
                                "Đã duyệt đánh giá thành công!"));
        }

        @Operation(summary = "Từ chối review")
        @PutMapping("/{reviewId}/reject")
        public ResponseEntity<ApiResponse<ReviewResponse>> reject(
                        @CurrentUser UUID userId,
                        @PathVariable UUID reviewId,
                        @Valid @RequestBody RejectReviewRequest req) {

                UUID companyId = resolveCompanyId(userId);

                // Kiểm tra review thuộc về công ty của mình
                CompanyReview review = reviewRepository.findById(reviewId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy đánh giá.", "REVIEW_NOT_FOUND"));

                if (!review.getCompanyId().equals(companyId)) {
                        throw new BusinessRuleException(
                                        "Bạn không có quyền từ chối đánh giá này.", "FORBIDDEN");
                }

                var cmd = RejectReviewUseCase.Command.builder()
                                .reviewId(reviewId)
                                .reviewerId(userId) // Sử dụng userId làm reviewerId (người thực hiện reject)
                                .reason(req.getReason())
                                .build();

                CompanyReview rejectedReview = rejectReviewUseCase.execute(cmd);

                return ResponseEntity.ok(ApiResponse.success(ReviewResponse.from(rejectedReview),
                                "Đã từ chối đánh giá!"));
        }

        /**
         * Lấy companyId từ ownerId (userId từ token).
         * Throw BusinessRuleException nếu user chưa có hồ sơ công ty.
         */
        private UUID resolveCompanyId(UUID ownerId) {
                return companyRepository.findByOwnerId(ownerId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Bạn chưa có hồ sơ công ty. Vui lòng tạo hồ sơ trước.",
                                                "COMPANY_PROFILE_NOT_FOUND"))
                                .getId();
        }
}