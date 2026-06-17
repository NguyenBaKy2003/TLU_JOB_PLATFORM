package edu.tlu.jobplatform.company.domain.service;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewValidationService {

    private final CompanyRepository companyRepository;

    public void validateCanReview(UUID companyId, UUID reviewerId) {
        CompanyProfile company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Công ty không tồn tại hoặc đã bị xóa.",
                        "COMPANY_NOT_FOUND"));

        if (!company.isVerified()) {
            throw new BusinessRuleException(
                    "Chỉ có thể đánh giá công ty đã được xác thực. " +
                            "Công ty này chưa hoàn tất quy trình xác thực.",
                    "REVIEW_COMPANY_NOT_VERIFIED");
        }

        if (company.isSuspended()) {
            throw new BusinessRuleException(
                    "Không thể đánh giá công ty đang bị tạm ngưng hoạt động.",
                    "REVIEW_COMPANY_SUSPENDED");
        }
    }

    /**
     * Validate rating value.
     * Rating phải từ 1 đến 5.
     */
    public void validateRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new BusinessRuleException(
                    "Đánh giá phải từ 1 đến 5 sao. Giá trị không hợp lệ: " + rating,
                    "REVIEW_INVALID_RATING");
        }
    }

    /**
     * Validate có thể duyệt review không.
     * 
     * Business Rules:
     * 1. Review phải ở trạng thái PENDING
     * 2. Company admin chỉ được duyệt review của công ty mình (checked in
     * authorization layer)
     */
    public void validateCanApprove(CompanyReview review, UUID approverId) {
        if (review.getStatus() != ReviewStatus.PENDING) {
            throw new BusinessRuleException(
                    "Chỉ có thể duyệt đánh giá đang ở trạng thái chờ duyệt. " +
                            "Trạng thái hiện tại: " + review.getStatus().name(),
                    "REVIEW_ALREADY_PROCESSED");
        }
        // Authorization check for company admin is done in the Controller/Service layer
        // using @PreAuthorize and SecurityUtils
    }

    /**
     * Validate có thể từ chối review không.
     * 
     * Business Rules:
     * 1. Review phải ở trạng thái PENDING
     * 2. Phải có lý do từ chối hợp lệ
     */
    public void validateCanReject(CompanyReview review, UUID reviewerId) {
        if (review.getStatus() != ReviewStatus.PENDING) {
            throw new BusinessRuleException(
                    "Chỉ có thể từ chối đánh giá đang ở trạng thái chờ duyệt. " +
                            "Trạng thái hiện tại: " + review.getStatus().name(),
                    "REVIEW_ALREADY_PROCESSED");
        }
    }

    /**
     * Validate lý do từ chối.
     * 
     * Business Rules:
     * 1. Không được null hoặc empty
     * 2. Tối thiểu 10 ký tự để đảm bảo người dùng hiểu rõ lý do
     * 3. Tối đa 500 ký tự
     */
    public void validateRejectionReason(String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new BusinessRuleException(
                    "Phải cung cấp lý do từ chối đánh giá. " +
                            "Lý do giúp người dùng hiểu và cải thiện đánh giá của họ.",
                    "REVIEW_REJECTION_REASON_REQUIRED");
        }

        String trimmedReason = reason.trim();

        if (trimmedReason.length() < 10) {
            throw new BusinessRuleException(
                    "Lý do từ chối phải có ít nhất 10 ký tự. " +
                            "Vui lòng cung cấp lý do chi tiết hơn để người dùng hiểu rõ.",
                    "REVIEW_REJECTION_REASON_REQUIRED");
        }

        if (trimmedReason.length() > 500) {
            throw new BusinessRuleException(
                    "Lý do từ chối không được vượt quá 500 ký tự. " +
                            "Vui lòng tóm gọn lý do trong giới hạn cho phép.",
                    "REVIEW_REJECTION_REASON_REQUIRED");
        }
    }

    /**
     * Validate user có thể cập nhật review không.
     * 
     * Business Rules:
     * 1. User phải là chủ sở hữu review (checked in UseCase)
     * 2. Review không ở trạng thái REJECTED
     */
    public void validateCanUpdate(CompanyReview review, UUID userId) {
        if (!review.getReviewerId().equals(userId)) {
            throw new BusinessRuleException(
                    "Bạn không có quyền cập nhật đánh giá này.",
                    "REVIEW_NOT_OWNER");
        }

        if (review.getStatus() == ReviewStatus.REJECTED) {
            throw new BusinessRuleException(
                    "Không thể cập nhật đánh giá đã bị từ chối. " +
                            "Vui lòng tạo đánh giá mới nếu bạn muốn chia sẻ ý kiến khác.",
                    "REVIEW_INVALID_STATUS");
        }
    }

    /**
     * Validate user có thể xóa review không.
     * 
     * Business Rules:
     * 1. User phải là chủ sở hữu review
     */
    public void validateCanDelete(CompanyReview review, UUID userId) {
        if (!review.getReviewerId().equals(userId)) {
            throw new BusinessRuleException(
                    "Bạn không có quyền xóa đánh giá này.",
                    "REVIEW_NOT_OWNER");
        }
    }

    /**
     * Validate admin có thể ẩn/hiện review không.
     * 
     * Business Rules:
     * 1. Review phải ở trạng thái APPROVED
     */
    public void validateCanModerate(CompanyReview review) {
        if (review.getStatus() != ReviewStatus.APPROVED) {
            throw new BusinessRuleException(
                    "Chỉ có thể ẩn/hiện đánh giá đã được duyệt. " +
                            "Trạng thái hiện tại: " + review.getStatus().name(),
                    "REVIEW_INVALID_STATUS");
        }
    }
}