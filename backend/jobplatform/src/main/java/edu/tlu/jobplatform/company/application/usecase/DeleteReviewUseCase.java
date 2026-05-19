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
public class DeleteReviewUseCase {

    private final CompanyReviewRepository reviewRepository;

    @Transactional
    public void deleteByOwner(UUID reviewId, UUID userId) {
        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ResourceNotFoundException.of("Review", reviewId));

        if (!review.getReviewerId().equals(userId)) {
            throw new BusinessRuleException(
                    "Bạn không có quyền xóa đánh giá này.",
                    "REVIEW_NOT_OWNER");
        }

        reviewRepository.deleteById(reviewId);
        log.info("Review deleted by owner: id={}, user={}", reviewId, userId);
    }

    @Transactional
    public void deleteByAdmin(UUID reviewId) {
        if (reviewRepository.findById(reviewId).isEmpty()) {
            throw ResourceNotFoundException.of("Review", reviewId);
        }

        reviewRepository.deleteById(reviewId);
        log.warn("Review deleted by admin: id={}", reviewId);
    }
}