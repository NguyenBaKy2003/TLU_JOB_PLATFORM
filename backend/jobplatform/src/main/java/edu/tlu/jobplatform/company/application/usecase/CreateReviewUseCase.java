package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.domain.service.ReviewValidationService;
import edu.tlu.jobplatform.shared.event.review.ReviewCreatedEvent;
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
public class CreateReviewUseCase {

        private final CompanyReviewRepository reviewRepository;
        private final ReviewValidationService validationService;
        private final ApplicationEventPublisher eventPublisher;
        private final CompanyRepository companyRepository;

        @Getter
        @Builder
        public static class Command {
                private UUID companyId;
                private UUID reviewerId;
                private int rating;
                private String title;
                private String content;
                private String pros;
                private String cons;
                private boolean anonymous;
                private boolean employed;
        }

        @Transactional
        public CompanyReview execute(Command cmd) {
                validationService.validateCanReview(cmd.getCompanyId(), cmd.getReviewerId());
                validationService.validateRating(cmd.getRating());

                if (reviewRepository.existsByCompanyIdAndReviewerId(
                                cmd.getCompanyId(), cmd.getReviewerId())) {
                        throw new BusinessRuleException(
                                        "Bạn đã đánh giá công ty này rồi. Mỗi người chỉ được đánh giá một lần.",
                                        "REVIEW_DUPLICATE");
                }

                CompanyReview review = CompanyReview.builder()
                                .id(UUID.randomUUID())
                                .companyId(cmd.getCompanyId())
                                .reviewerId(cmd.getReviewerId())
                                .rating(cmd.getRating())
                                .title(cmd.getTitle())
                                .content(cmd.getContent())
                                .pros(cmd.getPros())
                                .cons(cmd.getCons())
                                .anonymous(cmd.isAnonymous())
                                .employed(cmd.isEmployed())
                                .status(ReviewStatus.PENDING)
                                .visible(false)
                                .createdAt(java.time.LocalDateTime.now())
                                .updatedAt(java.time.LocalDateTime.now())
                                .build();

                CompanyReview saved = reviewRepository.save(review);
                UUID companyOwnerId = companyRepository.findById(cmd.getCompanyId())
                                .map(CompanyProfile::getOwnerId)
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", cmd.getCompanyId()));
                eventPublisher.publishEvent(new ReviewCreatedEvent(
                                saved.getId(),
                                saved.getCompanyId(),
                                companyOwnerId,
                                saved.getReviewerId(),
                                saved.getRating(),
                                cmd.isAnonymous() ? "Ẩn danh" : "User",
                                cmd.isAnonymous()));

                log.info("Review created: id={}, company={}, reviewer={}, status=PENDING",
                                saved.getId(), cmd.getCompanyId(), cmd.getReviewerId());

                return saved;
        }
}