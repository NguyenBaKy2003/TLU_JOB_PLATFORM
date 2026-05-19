package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.domain.service.ReviewValidationService;
import edu.tlu.jobplatform.shared.event.review.ReviewRejectedEvent;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RejectReviewUseCase {

    private final CompanyReviewRepository reviewRepository;
    private final ReviewValidationService validationService;
    private final ApplicationEventPublisher eventPublisher;

    @Getter
    @Builder
    public static class Command {
        private UUID reviewId;
        private UUID reviewerId;
        private String reason;
    }

    @Transactional
    public CompanyReview execute(Command cmd) {
        CompanyReview review = reviewRepository.findById(cmd.getReviewId())
                .orElseThrow(() -> ResourceNotFoundException.of("Review", cmd.getReviewId()));

        if (!review.isPending()) {
            throw new BusinessRuleException(
                    "Chỉ có thể từ chối đánh giá đang ở trạng thái chờ duyệt. " +
                            "Trạng thái hiện tại: " + review.getStatus(),
                    "REVIEW_ALREADY_PROCESSED");
        }

        validateRejectionReason(cmd.getReason());
        validationService.validateCanReject(review, cmd.getReviewerId());

        review.reject(cmd.getReviewerId(), cmd.getReason());
        CompanyReview saved = reviewRepository.save(review);

        eventPublisher.publishEvent(new ReviewRejectedEvent(
                saved.getId(),
                saved.getCompanyId(),
                saved.getReviewerId(),
                cmd.getReason(),
                "Đánh giá của bạn đã bị từ chối"));

        log.info("Review rejected: id={}, by={}, reason='{}'",
                cmd.getReviewId(), cmd.getReviewerId(), cmd.getReason());

        return saved;
    }

    private void validateRejectionReason(String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new BusinessRuleException(
                    "Phải cung cấp lý do từ chối đánh giá.",
                    "REVIEW_REJECTION_REASON_REQUIRED");
        }

        if (reason.trim().length() < 10) {
            throw new BusinessRuleException(
                    "Lý do từ chối phải có ít nhất 10 ký tự để người dùng hiểu rõ lý do.",
                    "REVIEW_REJECTION_REASON_REQUIRED");
        }

        if (reason.length() > 500) {
            throw new BusinessRuleException(
                    "Lý do từ chối không được vượt quá 500 ký tự.",
                    "REVIEW_REJECTION_REASON_REQUIRED");
        }
    }
}