package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.shared.event.review.ReviewUpdatedEvent;
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
public class UpdateReviewUseCase {

    private final CompanyReviewRepository reviewRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final CompanyRepository companyRepository;

    @Getter
    @Builder
    public static class Command {
        private UUID reviewId;
        private UUID userId;
        private int rating;
        private String title;
        private String content;
        private String pros;
        private String cons;
    }

    @Transactional
    public CompanyReview execute(Command cmd) {
        CompanyReview review = reviewRepository.findById(cmd.getReviewId())
                .orElseThrow(() -> ResourceNotFoundException.of("Review", cmd.getReviewId()));

        if (!review.getReviewerId().equals(cmd.getUserId())) {
            throw new BusinessRuleException(
                    "Bạn không có quyền cập nhật đánh giá này.",
                    "REVIEW_NOT_OWNER");
        }

        if (review.isApproved()) {
            throw new BusinessRuleException("Đánh giá đã được chấp nhận, không thể sửa đổi", "REVIEW_INVALID_STATUS");
        }

        if (review.isRejected()) {
            throw new BusinessRuleException(
                    "Không thể cập nhật đánh giá đã bị từ chối. Vui lòng tạo đánh giá mới.",
                    "REVIEW_INVALID_STATUS");
        }

        review.update(cmd.getRating(), cmd.getTitle(), cmd.getContent(),
                cmd.getPros(), cmd.getCons());
        CompanyReview saved = reviewRepository.save(review);
        UUID companyOwnerId = companyRepository.findById(saved.getCompanyId())
                .map(CompanyProfile::getOwnerId)
                .orElseThrow(() -> ResourceNotFoundException.of("Company", saved.getCompanyId()));
        eventPublisher.publishEvent(new ReviewUpdatedEvent(
                saved.getId(),
                saved.getCompanyId(),
                companyOwnerId,
                saved.getReviewerId(),
                "Đánh giá đã được cập nhật và đang chờ duyệt lại"));

        log.info("Review updated: id={}, status=PENDING (re-review required)", cmd.getReviewId());

        return saved;
    }
}