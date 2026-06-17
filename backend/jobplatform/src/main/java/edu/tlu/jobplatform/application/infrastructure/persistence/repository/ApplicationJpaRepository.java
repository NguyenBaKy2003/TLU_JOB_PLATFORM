package edu.tlu.jobplatform.application.infrastructure.persistence.repository;

import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.infrastructure.persistence.entity.ApplicationJpaEntity;
import edu.tlu.jobplatform.application.infrastructure.persistence.projection.ApplicationStatsProjection;
import edu.tlu.jobplatform.application.infrastructure.persistence.projection.ApplicationStatusCountProjection;
import edu.tlu.jobplatform.application.infrastructure.persistence.projection.JobPostAvgScoreProjection;
import edu.tlu.jobplatform.application.infrastructure.persistence.projection.JobPostCountProjection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ApplicationJpaRepository extends JpaRepository<ApplicationJpaEntity, UUID> {

    boolean existsByJobPostIdAndCandidateId(UUID jobPostId, UUID candidateId);

    int countByJobPostId(UUID id);

    @Query("SELECT AVG(a.aiScore) FROM ApplicationJpaEntity a WHERE a.jobPostId = :jobPostId AND a.aiScore IS NOT NULL")
    Optional<Double> averageAIScoreByJobPostId(@Param("jobPostId") UUID jobPostId);

    int countByCandidateId(UUID candidateId);

    int countByCandidateIdAndStatus(UUID candidateId, ApplicationStatus status);

    Page<ApplicationJpaEntity> findByCandidateId(UUID candidateId, Pageable p);

    Page<ApplicationJpaEntity> findByJobPostId(UUID jobPostId, Pageable p);

    Page<ApplicationJpaEntity> findByJobPostIdAndStatus(UUID jobPostId, ApplicationStatus status, Pageable p);

    Page<ApplicationJpaEntity> findByCompanyId(UUID companyId, Pageable p);

    Page<ApplicationJpaEntity> findByCompanyIdAndStatus(UUID companyId, ApplicationStatus status,
            Pageable pageable);

    Optional<ApplicationJpaEntity> findByJobPostIdAndCandidateId(UUID jobPostId, UUID candidateId);

    // ── Admin: listAll with optional status + keyword search ──

    @Query("""
            SELECT a FROM ApplicationJpaEntity a
            JOIN CandidateProfileJpaEntity cp ON cp.userId = a.candidateId
            JOIN JobPostJpaEntity            jp ON jp.id    = a.jobPostId
            WHERE (:status  IS NULL OR a.status = :status)
              AND (:keyword IS NULL OR :keyword = ''
                   OR LOWER(cp.firstName)  LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(jp.title)     LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<ApplicationJpaEntity> searchAll(
            @Param("status") ApplicationStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Tìm đơn theo công ty, lọc theo status (nullable) và keyword (nullable).
     */
    @Query("""
            SELECT a FROM ApplicationJpaEntity a
            JOIN CandidateProfileJpaEntity cp ON cp.userId = a.candidateId
            JOIN JobPostJpaEntity            jp ON jp.id    = a.jobPostId
            WHERE a.companyId = :companyId
              AND (:status  IS NULL OR a.status = :status)
              AND (:keyword IS NULL OR :keyword = ''
                   OR LOWER(cp.firstName)  LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(jp.title)     LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<ApplicationJpaEntity> searchByCompanyId(
            @Param("companyId") UUID companyId,
            @Param("status") ApplicationStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Tìm đơn theo bài đăng, lọc theo status (nullable) và keyword (nullable).
     */
    @Query("""
            SELECT a FROM ApplicationJpaEntity a
            JOIN CandidateProfileJpaEntity cp ON cp.userId = a.candidateId
            WHERE a.jobPostId = :jobPostId
              AND (:status  IS NULL OR a.status = :status)
              AND (:keyword IS NULL OR :keyword = ''
                   OR LOWER(cp.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<ApplicationJpaEntity> searchByJobPostId(
            @Param("jobPostId") UUID jobPostId,
            @Param("status") ApplicationStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("""
            SELECT a FROM ApplicationJpaEntity a
            JOIN CandidateProfileJpaEntity cp ON cp.userId = a.candidateId
            WHERE a.jobPostId = :jobPostId
            ORDER BY
                CASE WHEN cp.boostedUntil > CURRENT_TIMESTAMP THEN 0 ELSE 1 END ASC,
                a.aiScore DESC NULLS LAST
            """)
    Page<ApplicationJpaEntity> findByJobPostIdOrderByBoostFirst(
            @Param("jobPostId") UUID jobPostId,
            Pageable pageable);

    @Query("""
            SELECT a FROM ApplicationJpaEntity a
            JOIN CandidateProfileJpaEntity cp ON cp.userId = a.candidateId
            WHERE a.jobPostId = :jobPostId
              AND a.status = :status
            ORDER BY
                CASE WHEN cp.boostedUntil > CURRENT_TIMESTAMP THEN 0 ELSE 1 END ASC,
                a.aiScore DESC NULLS LAST
            """)
    Page<ApplicationJpaEntity> findByJobPostIdAndStatusOrderByBoostFirst(
            @Param("jobPostId") UUID jobPostId,
            @Param("status") ApplicationStatus status,
            Pageable pageable);

    @Query("""
            SELECT a FROM ApplicationJpaEntity a
            JOIN CandidateProfileJpaEntity cp ON cp.userId = a.candidateId
            WHERE a.companyId = :companyId
            ORDER BY
                CASE WHEN cp.boostedUntil > CURRENT_TIMESTAMP THEN 0 ELSE 1 END ASC,
                a.appliedAt DESC
            """)
    Page<ApplicationJpaEntity> findByCompanyIdOrderByBoostFirst(
            @Param("companyId") UUID companyId,
            Pageable pageable);

    @Query("""
            SELECT a FROM ApplicationJpaEntity a
            JOIN CandidateProfileJpaEntity cp ON cp.userId = a.candidateId
            WHERE a.companyId = :companyId
              AND a.status = :status
            ORDER BY
                CASE WHEN cp.boostedUntil > CURRENT_TIMESTAMP THEN 0 ELSE 1 END ASC,
                a.appliedAt DESC
            """)
    Page<ApplicationJpaEntity> findByCompanyIdAndStatusOrderByBoostFirst(
            @Param("companyId") UUID companyId,
            @Param("status") ApplicationStatus status,
            Pageable pageable);

    // Candidate
    @Query("""
            SELECT a FROM ApplicationJpaEntity a
            JOIN JobPostJpaEntity jp ON jp.id = a.jobPostId
            WHERE a.candidateId = :candidateId
              AND (:status  IS NULL OR a.status = :status)
              AND (:keyword IS NULL OR :keyword = ''
                   OR LOWER(jp.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (CAST(:appliedAtFrom AS java.time.LocalDateTime) IS NULL OR a.appliedAt >= :appliedAtFrom)
              AND (CAST(:appliedAtTo   AS java.time.LocalDateTime) IS NULL OR a.appliedAt <= :appliedAtTo)
            ORDER BY a.appliedAt DESC
            """)
    Page<ApplicationJpaEntity> searchByCandidateId(
            @Param("candidateId") UUID candidateId,
            @Param("status") ApplicationStatus status,
            @Param("keyword") String keyword,
            @Param("appliedAtFrom") LocalDateTime appliedAtFrom,
            @Param("appliedAtTo") LocalDateTime appliedAtTo,
            Pageable pageable);

    @Query("""
            SELECT a.status AS status, COUNT(a) AS count
            FROM ApplicationJpaEntity a
            WHERE a.candidateId = :candidateId
            GROUP BY a.status
            """)
    List<ApplicationStatusCountProjection> countGroupByStatusForCandidate(
            @Param("candidateId") UUID candidateId);

    @Query(value = """
            SELECT * FROM public.applications
            WHERE company_id = :companyId
              AND status = 'INTERVIEW_SCHEDULED'
              AND (CAST(:from AS timestamp) IS NULL OR interview_scheduled_at >= CAST(:from AS timestamp))
              AND (CAST(:to   AS timestamp) IS NULL OR interview_scheduled_at <= CAST(:to   AS timestamp))
            ORDER BY interview_scheduled_at
            """, countQuery = """
            SELECT COUNT(*) FROM public.applications
            WHERE company_id = :companyId
              AND status = 'INTERVIEW_SCHEDULED'
              AND (CAST(:from AS timestamp) IS NULL OR interview_scheduled_at >= CAST(:from AS timestamp))
              AND (CAST(:to   AS timestamp) IS NULL OR interview_scheduled_at <= CAST(:to   AS timestamp))
            """, nativeQuery = true)
    Page<ApplicationJpaEntity> findInterviewScheduledByCompanyId(
            @Param("companyId") UUID companyId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);

    @Query("""
            SELECT
                COUNT(a)                                                        AS totalApply,
                SUM(CASE WHEN a.status = 'INTERVIEW_SCHEDULED' THEN 1 ELSE 0 END) AS totalPass,
                (SELECT COUNT(a2) FROM ApplicationJpaEntity a2
                 WHERE a2.jobPostId = :jobPostId)                               AS currentApplicantCount
            FROM ApplicationJpaEntity a
            WHERE a.candidateId = :candidateId
            """)
    ApplicationStatsProjection getStats(
            @Param("candidateId") UUID candidateId,
            @Param("jobPostId") UUID jobPostId);

    @Query("""
            SELECT a.jobPostId AS jobPostId, COUNT(a) AS count
            FROM ApplicationJpaEntity a
            WHERE a.jobPostId IN :jobIds
            GROUP BY a.jobPostId
            """)
    List<JobPostCountProjection> countByJobPostIds(@Param("jobIds") Set<UUID> jobIds);

    @Query("""
            SELECT a.jobPostId AS jobPostId, AVG(a.aiScore) AS avgScore
            FROM ApplicationJpaEntity a
            WHERE a.jobPostId IN :jobIds
              AND a.aiScore IS NOT NULL
            GROUP BY a.jobPostId
            """)
    List<JobPostAvgScoreProjection> avgAiScoreByJobPostIds(@Param("jobIds") Set<UUID> jobIds);

}