package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModerateReviewUseCase {

    private final CompanyReviewRepository reviewRepository;

    @Transactional
    public void hide(UUID reviewId) {
        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ResourceNotFoundException.of("Review", reviewId));

        if (!review.isApproved()) {
            throw new BusinessRuleException(
                    "Chỉ có thể ẩn đánh giá đã được duyệt. Trạng thái hiện tại: " + review.getStatus(),
                    "REVIEW_INVALID_STATUS");
        }

        review.hide();
        reviewRepository.save(review);
        log.warn("Review hidden: id={}", reviewId);
    }

    @Transactional
    public void show(UUID reviewId) {
        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ResourceNotFoundException.of("Review", reviewId));

        if (!review.isApproved()) {
            throw new BusinessRuleException(
                    "Chỉ có thể hiển thị lại đánh giá đã được duyệt. Trạng thái hiện tại: " + review.getStatus(),
                    "REVIEW_INVALID_STATUS");
        }

        review.show();
        reviewRepository.save(review);
        log.info("Review shown: id={}", reviewId);
    }
}