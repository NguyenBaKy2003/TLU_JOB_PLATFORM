package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyReviewJpaEntity;
import edu.tlu.jobplatform.company.infrastructure.persistence.projection.CompanyReviewCountProjection;

import java.time.LocalDateTime;
import java.util.List;
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
  @Query("SELECT COUNT(r) FROM CompanyReviewJpaEntity r " +
      "WHERE r.companyId = :companyId AND r.status = :status AND r.visible = true")
  long countByCompanyIdAndStatus(@Param("companyId") UUID companyId,
      @Param("status") ReviewStatus status);

  /** Đếm số lượng review theo rating và status */
  @Query("SELECT COUNT(r) FROM CompanyReviewJpaEntity r " +
      "WHERE r.companyId = :companyId AND r.rating = :rating AND r.status = :status AND r.visible = true")
  long countByCompanyIdAndRatingAndStatus(@Param("companyId") UUID companyId,
      @Param("rating") int rating,
      @Param("status") ReviewStatus status);

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

  /** Count theo status để render tab counter */
  @Query("""
      SELECT r.status AS status, COUNT(r) AS count
      FROM CompanyReviewJpaEntity r
      WHERE r.reviewerId = :reviewerId
      GROUP BY r.status
      """)
  List<CompanyReviewCountProjection> countByStatusForReviewer(@Param("reviewerId") UUID reviewerId);

  /** Full search: lọc theo tên công ty join qua companyId */
  @Query(value = """
      SELECT r.* FROM public.company_reviews r
      JOIN public.company_profiles c ON c.id = r.company_id
      WHERE r.reviewer_id = CAST(:reviewerId AS uuid)
        AND (CAST(:status  AS text) IS NULL OR r.status = CAST(:status AS text))
        AND (CAST(:keyword AS text) IS NULL
             OR LOWER(c.name)  LIKE CAST(:keyword AS text)
             OR LOWER(r.title) LIKE CAST(:keyword AS text))
        AND (CAST(:fromDt AS timestamp) IS NULL OR r.created_at >= CAST(:fromDt AS timestamp))
        AND (CAST(:toDt   AS timestamp) IS NULL OR r.created_at <= CAST(:toDt   AS timestamp))
      ORDER BY r.created_at DESC
      """, countQuery = """
      SELECT COUNT(*) FROM public.company_reviews r
      JOIN public.company_profiles c ON c.id = r.company_id
      WHERE r.reviewer_id = CAST(:reviewerId AS uuid)
        AND (CAST(:status  AS text) IS NULL OR r.status = CAST(:status AS text))
        AND (CAST(:keyword AS text) IS NULL
             OR LOWER(c.name)  LIKE CAST(:keyword AS text)
             OR LOWER(r.title) LIKE CAST(:keyword AS text))
        AND (CAST(:fromDt AS timestamp) IS NULL OR r.created_at >= CAST(:fromDt AS timestamp))
        AND (CAST(:toDt   AS timestamp) IS NULL OR r.created_at <= CAST(:toDt   AS timestamp))
      """, nativeQuery = true)
  Page<CompanyReviewJpaEntity> searchByReviewerId(
      @Param("reviewerId") UUID reviewerId,
      @Param("status") String status, // null hoặc "PENDING"/"APPROVED"/"REJECTED"
      @Param("keyword") String keyword, // null hoặc "%abc%" (đã chuẩn bị sẵn ở Adapter)
      @Param("fromDt") LocalDateTime fromDt,
      @Param("toDt") LocalDateTime toDt,
      Pageable pageable);
}