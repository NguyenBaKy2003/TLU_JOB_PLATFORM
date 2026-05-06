package edu.tlu.jobplatform.application.infrastructure.persistence.repository;

import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.infrastructure.persistence.entity.ApplicationJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
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

    /**
     * Tìm tất cả đơn, lọc theo status (nullable) và keyword (nullable).
     * Keyword so khớp ILIKE với: candidate full name, candidate email, job title.
     *
     * JOIN sang candidate_profile và job_post để search cross-entity.
     */
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
}