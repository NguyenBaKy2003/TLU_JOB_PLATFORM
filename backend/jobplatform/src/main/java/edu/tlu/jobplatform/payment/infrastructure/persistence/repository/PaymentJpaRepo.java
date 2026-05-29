package edu.tlu.jobplatform.payment.infrastructure.persistence.repository;

import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.infrastructure.persistence.entity.PaymentJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentJpaRepo extends JpaRepository<PaymentJpaEntity, UUID> {

  Optional<PaymentJpaEntity> findByGatewayOrderCode(String gatewayOrderCode);

  // ── Company ───────────────────────────────────────────────────────

  @Query("""
      SELECT p FROM PaymentJpaEntity p
      WHERE p.companyId = :companyId
        AND p.status = 'PENDING'
      ORDER BY p.createdAt DESC
      LIMIT 1
      """)
  Optional<PaymentJpaEntity> findPendingByCompanyId(@Param("companyId") UUID companyId);

  Page<PaymentJpaEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

  Page<PaymentJpaEntity> findByCompanyIdAndStatusOrderByCreatedAtDesc(
      UUID companyId, PaymentStatus status, Pageable pageable);

  // ── Candidate ─────────────────────────────────────────────────────

  @Query("""
      SELECT p FROM PaymentJpaEntity p
      WHERE p.candidateId = :candidateId
        AND p.status = 'PENDING'
      ORDER BY p.createdAt DESC
      LIMIT 1
      """)
  Optional<PaymentJpaEntity> findPendingByCandidateId(@Param("candidateId") UUID candidateId);

  Page<PaymentJpaEntity> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId, Pageable pageable);

  Page<PaymentJpaEntity> findByCandidateIdAndStatusOrderByCreatedAtDesc(
      UUID candidateId, PaymentStatus status, Pageable pageable);

  // ── Admin search ──────────────────────────────────────────────────

  @Query("""
      SELECT p FROM PaymentJpaEntity p
      WHERE (:companyId   IS NULL OR p.companyId   = :companyId)
        AND (:candidateId IS NULL OR p.candidateId = :candidateId)
        AND (:status      IS NULL OR p.status      = :status)
        AND (:gateway     IS NULL OR LOWER(p.gateway) = LOWER(CAST(:gateway AS string)))
        AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR p.createdAt >= :fromDate)
        AND (CAST(:toDate   AS java.time.LocalDateTime) IS NULL OR p.createdAt <= :toDate)
      ORDER BY p.createdAt DESC
      """)
  Page<PaymentJpaEntity> searchPayments(
      @Param("companyId") UUID companyId,
      @Param("candidateId") UUID candidateId,
      @Param("status") PaymentStatus status,
      @Param("gateway") String gateway,
      @Param("fromDate") LocalDateTime fromDate,
      @Param("toDate") LocalDateTime toDate,
      Pageable pageable);

  @Query("""
      SELECT COALESCE(SUM(p.amount), 0)
      FROM PaymentJpaEntity p
      WHERE p.status = 'SUCCESS'
        AND (CAST(:from AS java.time.LocalDateTime) IS NULL OR p.completedAt >= :from)
        AND (CAST(:to   AS java.time.LocalDateTime) IS NULL OR p.completedAt <= :to)
      """)
  BigDecimal sumSuccessAmount(
      @Param("from") LocalDateTime from,
      @Param("to") LocalDateTime to);

  long countByStatus(PaymentStatus status);

  // ── Candidate search ──────────────────────────────────────────────

  @Query("""
      SELECT p FROM PaymentJpaEntity p
      WHERE p.candidateId = :candidateId
        AND (:status  IS NULL OR p.status = :status)
        AND (CAST(:gateway AS string)  IS NULL OR LOWER(p.gateway) = LOWER(CAST(:gateway AS string)))
        AND (CAST(:keyword AS string)  IS NULL
             OR LOWER(p.planCode)             LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
             OR LOWER(p.gatewayOrderCode)     LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
             OR LOWER(p.gatewayTransactionId) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
        AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR p.createdAt >= :fromDate)
        AND (CAST(:toDate   AS java.time.LocalDateTime) IS NULL OR p.createdAt <= :toDate)
      ORDER BY p.createdAt DESC
      """)
  Page<PaymentJpaEntity> searchByCandidateId(
      @Param("candidateId") UUID candidateId,
      @Param("status") PaymentStatus status,
      @Param("gateway") String gateway,
      @Param("keyword") String keyword,
      @Param("fromDate") LocalDateTime fromDate,
      @Param("toDate") LocalDateTime toDate,
      Pageable pageable);

  // ── Employer search ───────────────────────────────────────────────

  @Query("""
      SELECT p FROM PaymentJpaEntity p
      WHERE p.companyId = :companyId
        AND (:status  IS NULL OR p.status = :status)
        AND (CAST(:gateway AS string)  IS NULL OR LOWER(p.gateway) = LOWER(CAST(:gateway AS string)))
        AND (CAST(:keyword AS string)  IS NULL
             OR LOWER(p.planCode)             LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
             OR LOWER(p.gatewayOrderCode)     LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
             OR LOWER(p.gatewayTransactionId) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
        AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR p.createdAt >= :fromDate)
        AND (CAST(:toDate   AS java.time.LocalDateTime) IS NULL OR p.createdAt <= :toDate)
      ORDER BY p.createdAt DESC
      """)
  Page<PaymentJpaEntity> searchByCompanyId(
      @Param("companyId") UUID companyId,
      @Param("status") PaymentStatus status,
      @Param("gateway") String gateway,
      @Param("keyword") String keyword,
      @Param("fromDate") LocalDateTime fromDate,
      @Param("toDate") LocalDateTime toDate,
      Pageable pageable);
}