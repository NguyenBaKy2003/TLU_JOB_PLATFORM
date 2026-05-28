package edu.tlu.jobplatform.company.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface CompanyReviewRepository {

    // ── Find by ID ──

    Optional<CompanyReview> findById(UUID id);

    // ── Exists ──

    /** Kiểm tra user đã review công ty này chưa */
    boolean existsByCompanyIdAndReviewerId(UUID companyId, UUID reviewerId);

    // ── Public Queries ──

    /** Danh sách review đã được duyệt và visible của 1 công ty (cho public) */
    Page<CompanyReview> findApprovedAndVisibleByCompanyId(UUID companyId, Pageable pageable);

    // ── Company Management Queries ──

    /** Danh sách review theo status của 1 công ty */
    Page<CompanyReview> findByCompanyIdAndStatus(UUID companyId, ReviewStatus status, Pageable pageable);

    /** Tất cả review của công ty */
    Page<CompanyReview> findAllByCompanyId(UUID companyId, Pageable pageable);

    // ── User Queries ──

    /** Tìm review theo reviewer (có thể lọc theo status) */
    Page<CompanyReview> findByReviewerId(UUID reviewerId, Pageable pageable);

    Page<CompanyReview> searchByReviewerId(
            UUID reviewerId,
            ReviewStatus status,
            String keyword,
            LocalDateTime createdAtFrom,
            LocalDateTime createdAtTo,
            Pageable pageable);

    /** Đếm theo status — dùng cho tab counter, 1 query */
    Map<ReviewStatus, Long> countByStatusForReviewer(UUID reviewerId);

    Page<CompanyReview> findByReviewerIdAndStatus(UUID reviewerId, ReviewStatus status, Pageable pageable);

    // ── Admin Queries ──

    /** Tìm tất cả review theo status */
    Page<CompanyReview> findByStatus(ReviewStatus status, Pageable pageable);

    /** Tìm tất cả review */
    Page<CompanyReview> findAll(Pageable pageable);

    // ── Statistics ──

    /** Điểm trung bình rating của công ty (chỉ tính approved & visible) */
    Double getAverageRatingByCompanyId(UUID companyId);

    /** Đếm số lượng review theo status */
    long countByCompanyIdAndStatus(UUID companyId, ReviewStatus status);

    /** Đếm số lượng review theo rating và status */
    long countByCompanyIdAndRatingAndStatus(UUID companyId, int rating, ReviewStatus status);

    /** Đếm tổng số review của công ty */
    long countByCompanyId(UUID companyId);

    // ── CRUD ──

    CompanyReview save(CompanyReview review);

    void deleteById(UUID id);
}