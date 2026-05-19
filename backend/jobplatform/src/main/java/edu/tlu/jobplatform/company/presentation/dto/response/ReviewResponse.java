package edu.tlu.jobplatform.company.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Response đánh giá công ty")
public class ReviewResponse {

    @Schema(description = "ID của review")
    private UUID id;

    @Schema(description = "ID công ty được đánh giá")
    private UUID companyId;

    @Schema(description = "Tên người đánh giá (Ẩn danh nếu anonymous=true)")
    private String reviewerName;

    @Schema(description = "Số sao đánh giá (1-5)")
    private int rating;

    @Schema(description = "Tiêu đề đánh giá")
    private String title;

    @Schema(description = "Nội dung chi tiết")
    private String content;

    @Schema(description = "Điểm tốt")
    private String pros;

    @Schema(description = "Điểm chưa tốt")
    private String cons;

    @Schema(description = "Có ẩn danh không")
    private boolean anonymous;

    @Schema(description = "Đã/đang làm việc tại công ty")
    private boolean employed;

    @Schema(description = "Trạng thái phê duyệt")
    private ReviewStatus status;

    @Schema(description = "Lý do từ chối (chỉ có khi status=REJECTED)")
    private String rejectionReason;

    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;

    @Schema(description = "Thời gian cập nhật gần nhất")
    private LocalDateTime updatedAt;

    @Schema(description = "Thời gian được duyệt/từ chối (chỉ cho admin/company)")
    private LocalDateTime reviewedAt;

    /**
     * Convert từ domain model sang DTO
     * Cần inject UserService để lấy tên reviewer nếu không anonymous
     */
    public static ReviewResponse from(CompanyReview review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .companyId(review.getCompanyId())
                .reviewerName(review.isAnonymous() ? "Ẩn danh" : null) // Sẽ được set sau khi fetch user info
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .pros(review.getPros())
                .cons(review.getCons())
                .anonymous(review.isAnonymous())
                .employed(review.isEmployed())
                .status(review.getStatus())
                .rejectionReason(review.getRejectionReason())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .reviewedAt(review.getReviewedAt())
                .build();
    }

    /**
     * Convert từ domain model sang DTO với tên reviewer
     */
    public static ReviewResponse from(CompanyReview review, String reviewerName) {
        ReviewResponse response = from(review);
        response.setReviewerName(review.isAnonymous() ? "Ẩn danh" : reviewerName);
        return response;
    }
}