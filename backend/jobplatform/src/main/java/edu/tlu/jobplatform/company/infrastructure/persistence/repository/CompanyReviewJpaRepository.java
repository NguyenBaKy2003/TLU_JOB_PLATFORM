package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyReviewJpaEntity;

import java.util.UUID;

@Repository
public interface CompanyReviewJpaRepository extends JpaRepository<CompanyReviewJpaEntity, UUID> {

    // ── Exists ──

    boolean existsByCompanyIdAndReviewerId(UUID companyId, UUID reviewerId);

    // ── Query by Company ──

    /** Chỉ lấy review approved và visible cho public */
    Page<CompanyReviewJpaEntity> findByCompanyIdAndStatusAndVisibleTrue(
            UUID companyId, ReviewStatus status, Pageable pageable);

    /** Lọc theo status của 1 công ty */
    Page<CompanyReviewJpaEntity> findByCompanyIdAndStatus(
            UUID companyId, ReviewStatus status, Pageable pageable);

    /** Tất cả review của công ty */
    Page<CompanyReviewJpaEntity> findByCompanyId(UUID companyId, Pageable pageable);

    // ── Query by Reviewer ──

    /** Tìm review theo reviewer và status (nếu status null thì lấy tất cả) */
    Page<CompanyReviewJpaEntity> findByReviewerId(UUID reviewerId, Pageable pageable);

    Page<CompanyReviewJpaEntity> findByReviewerIdAndStatus(
            UUID reviewerId, ReviewStatus status, Pageable pageable);

    // ── Query by Status (Admin) ──

    /** Tìm tất cả review theo status */
    Page<CompanyReviewJpaEntity> findByStatus(ReviewStatus status, Pageable pageable);

    /** Tìm tất cả review (không filter status) */
    Page<CompanyReviewJpaEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // ── Statistics ──

    /** Tính điểm trung bình chỉ từ các review approved & visible */
    @Query("SELECT AVG(r.rating) FROM CompanyReviewJpaEntity r " +
            "WHERE r.companyId = :companyId AND r.status = 'APPROVED' AND r.visible = true")
    Double findAverageRatingByCompanyId(@Param("companyId") UUID companyId);

    /** Đếm số lượng review theo status */
    long countByCompanyIdAndStatus(UUID companyId, ReviewStatus status);

    /** Đếm số lượng review theo rating và status */
    long countByCompanyIdAndRatingAndStatus(UUID companyId, int rating, ReviewStatus status);

    /** Đếm tổng số review của công ty */
    long countByCompanyId(UUID companyId);

    // ── Pending Reviews ──

    /** Tìm review pending của công ty (sắp xếp theo thời gian tạo) */
    @Query("SELECT r FROM CompanyReviewJpaEntity r " +
            "WHERE r.companyId = :companyId AND r.status = 'PENDING' " +
            "ORDER BY r.createdAt DESC")
    Page<CompanyReviewJpaEntity> findPendingReviewsByCompanyId(
            @Param("companyId") UUID companyId, Pageable pageable);

    /** Tìm tất cả review pending (cho Admin) */
    @Query("SELECT r FROM CompanyReviewJpaEntity r " +
            "WHERE r.status = 'PENDING' " +
            "ORDER BY r.createdAt DESC")
    Page<CompanyReviewJpaEntity> findAllPendingReviews(Pageable pageable);
}