package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.domain.service.ReviewValidationService;
import edu.tlu.jobplatform.shared.event.review.ReviewApprovedEvent;
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
public class ApproveReviewUseCase {

    private final CompanyReviewRepository reviewRepository;
    private final ReviewValidationService validationService;
    private final ApplicationEventPublisher eventPublisher;

    @Getter
    @Builder
    public static class Command {
        private UUID reviewId;
        private UUID approverId;
    }

    @Transactional
    public CompanyReview execute(Command cmd) {
        CompanyReview review = reviewRepository.findById(cmd.getReviewId())
                .orElseThrow(() -> ResourceNotFoundException.of("Review", cmd.getReviewId()));

        if (!review.isPending()) {
            throw new BusinessRuleException(
                    "Chỉ có thể duyệt đánh giá đang ở trạng thái chờ duyệt. " +
                            "Trạng thái hiện tại: " + review.getStatus(),
                    "REVIEW_ALREADY_PROCESSED");
        }

        validationService.validateCanApprove(review, cmd.getApproverId());

        review.approve(cmd.getApproverId());
        CompanyReview saved = reviewRepository.save(review);

        eventPublisher.publishEvent(new ReviewApprovedEvent(
                saved.getId(),
                saved.getCompanyId(),
                saved.getReviewerId(),
                saved.getRating(),
                "Đánh giá của bạn đã được duyệt và hiển thị công khai"));

        log.info("Review approved: id={}, by={}", cmd.getReviewId(), cmd.getApproverId());

        return saved;
    }
}