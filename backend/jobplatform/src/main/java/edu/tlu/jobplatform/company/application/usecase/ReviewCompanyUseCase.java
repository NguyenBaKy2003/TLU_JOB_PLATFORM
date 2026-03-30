package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UseCase: Viết và quản lý đánh giá công ty.
 *
 * Business Rules:
 * BR-01: Chỉ CANDIDATE mới được viết review
 * BR-02: 1 user chỉ review 1 công ty 1 lần
 * BR-03: Công ty phải tồn tại và đang active
 * BR-04: Chỉ reviewer hoặc ADMIN mới được xóa/sửa review
 * BR-05: ADMIN có thể ẩn review vi phạm
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewCompanyUseCase {

    private final CompanyRepository companyRepository;
    private final CompanyReviewRepository reviewRepository;

    // ── Tạo review mới ────────────────────────────────────────

    @Transactional
    public CompanyReview create(CreateCommand cmd) {

        // BR-03: Công ty phải tồn tại
        companyRepository.findById(cmd.companyId())
                .orElseThrow(() -> ResourceNotFoundException.of("Company", cmd.companyId()));

        // BR-02: Không được review 2 lần
        if (reviewRepository.existsByCompanyIdAndReviewerId(cmd.companyId(), cmd.reviewerId())) {
            throw new BusinessRuleException(
                    "Bạn đã đánh giá công ty này rồi. Mỗi công ty chỉ được đánh giá 1 lần.",
                    "REVIEW_ALREADY_EXISTS");
        }

        if (cmd.rating() < 1 || cmd.rating() > 5)
            throw new BusinessRuleException("Rating phải từ 1 đến 5.", "INVALID_RATING");

        CompanyReview review = CompanyReview.builder()
                .id(UUID.randomUUID())
                .companyId(cmd.companyId())
                .reviewerId(cmd.reviewerId())
                .rating(cmd.rating())
                .title(cmd.title())
                .content(cmd.content())
                .pros(cmd.pros())
                .cons(cmd.cons())
                .anonymous(cmd.anonymous())
                .employed(cmd.employed())
                .visible(true)
                .createdAt(LocalDateTime.now())
                .build();

        CompanyReview saved = reviewRepository.save(review);
        log.info("Review created for company={} by user={}", cmd.companyId(), cmd.reviewerId());
        return saved;
    }

    // ── Ẩn review (Admin) ─────────────────────────────────────

    @Transactional
    public void hide(UUID reviewId) {
        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ResourceNotFoundException.of("CompanyReview", reviewId));
        review.hide();
        reviewRepository.save(review);
    }

    // ── Xóa review (Owner hoặc Admin) ─────────────────────────

    @Transactional
    public void delete(UUID reviewId) {
        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ResourceNotFoundException.of("CompanyReview", reviewId));

        if (!SecurityUtils.isOwnerOrAdmin(review.getReviewerId()))
            throw new BusinessRuleException("Bạn không có quyền xóa đánh giá này.", "FORBIDDEN");

        reviewRepository.deleteById(reviewId);
    }

    // ── Commands ──────────────────────────────────────────────

    public record CreateCommand(
            UUID companyId,
            UUID reviewerId,
            int rating,
            String title,
            String content,
            String pros,
            String cons,
            boolean anonymous,
            boolean employed) {
    }
}