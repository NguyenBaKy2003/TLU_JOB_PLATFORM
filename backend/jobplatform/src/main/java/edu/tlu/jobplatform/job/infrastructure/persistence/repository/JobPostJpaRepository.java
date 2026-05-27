package edu.tlu.jobplatform.job.infrastructure.persistence.repository;

import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.infrastructure.persistence.entity.JobPostJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobPostJpaRepository extends JpaRepository<JobPostJpaEntity, UUID> {

     Optional<JobPostJpaEntity> findBySlug(String slug);

     boolean existsBySlug(String slug);

     @Query("SELECT j FROM JobPostJpaEntity j LEFT JOIN FETCH j.skills WHERE j.id = :id")
     Optional<JobPostJpaEntity> findByIdWithSkills(@Param("id") UUID id);

     @Query("SELECT j FROM JobPostJpaEntity j LEFT JOIN FETCH j.skills WHERE j.slug = :slug")
     Optional<JobPostJpaEntity> findBySlugWithSkills(@Param("slug") String slug);

     Page<JobPostJpaEntity> findByCompanyId(UUID companyId, Pageable pageable);

     Page<JobPostJpaEntity> findByCompanyIdAndStatus(UUID companyId, JobStatus status, Pageable pageable);

     Page<JobPostJpaEntity> findByPostedBy(UUID postedBy, Pageable pageable);

     Page<JobPostJpaEntity> findByStatus(JobStatus status, Pageable pageable);

     Page<JobPostJpaEntity> findByStatusAndIsActiveTrue(JobStatus status, Pageable pageable);

     @Query("SELECT j FROM JobPostJpaEntity j WHERE j.status = :status AND j.deadline < :date")
     List<JobPostJpaEntity> findByStatusAndDeadlineBefore(
               @Param("status") JobStatus status,
               @Param("date") LocalDate date);

     // ── Candidate search ──────────────────────────────────────────────────────

     @Query("""
               SELECT j FROM JobPostJpaEntity j
               WHERE j.status = 'PUBLISHED' AND j.isActive = true
               AND (:keyword IS NULL
                    OR LOWER(j.title)       LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                    OR LOWER(j.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
               AND (:city      IS NULL OR j.workLocationCity = :city)
               AND (:category  IS NULL OR j.category         = :category)
               AND (:jobType   IS NULL OR j.jobType          = :jobType)
               AND (:level     IS NULL OR j.level            = :level)
               AND (:companyId IS NULL OR j.companyId        = :companyId)
               """)
     Page<JobPostJpaEntity> search(
               @Param("keyword") String keyword,
               @Param("city") String city,
               @Param("category") String category,
               @Param("jobType") String jobType,
               @Param("level") String level,
               @Param("companyId") UUID companyId,
               Pageable pageable);

     // ── Employer: filtered list ───────────────────────────────────────────────

     @Query("""
               SELECT j FROM JobPostJpaEntity j
               WHERE j.postedBy = :postedBy
               AND (:status IS NULL OR j.status = :status)
               AND (:keyword IS NULL
                    OR LOWER(j.title)       LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                    OR LOWER(j.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
               AND (CAST(:createdAtFrom AS java.time.LocalDateTime) IS NULL OR j.createdAt >= :createdAtFrom)
               AND (CAST(:createdAtTo   AS java.time.LocalDateTime) IS NULL OR j.createdAt <= :createdAtTo)
               """)
     Page<JobPostJpaEntity> searchMyJobs(
               @Param("postedBy") UUID postedBy,
               @Param("status") JobStatus status,
               @Param("keyword") String keyword,
               @Param("createdAtFrom") LocalDateTime createdAtFrom,
               @Param("createdAtTo") LocalDateTime createdAtTo,
               Pageable pageable);

     // ── Employer: lightweight status counts ───────────────────────────────────

     /**
      * Trả về số lượng bài đăng theo từng trạng thái cho một employer.
      * Dùng cho GET /api/v1/jobs/my/counts — không load entity, chỉ đếm.
      */
     @Query("""
               SELECT j.status AS status, COUNT(j) AS count
               FROM JobPostJpaEntity j
               WHERE j.postedBy = :postedBy
               GROUP BY j.status
               """)
     List<StatusCountProjection> countMyJobsByStatus(@Param("postedBy") UUID postedBy);
}