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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobPostJpaRepository extends JpaRepository<JobPostJpaEntity, UUID> {

        Optional<JobPostJpaEntity> findBySlug(String slug);

        boolean existsBySlug(String slug);

        Page<JobPostJpaEntity> findByCompanyId(UUID companyId, Pageable pageable);

        Page<JobPostJpaEntity> findByPostedBy(UUID postedBy, Pageable pageable);

        Page<JobPostJpaEntity> findByStatus(JobStatus status, Pageable pageable);

        Page<JobPostJpaEntity> findByStatusAndIsActiveTrue(JobStatus status, Pageable pageable);

        /** Tìm bài đang PUBLISHED hết deadline — scheduler dùng */
        @Query("SELECT j FROM JobPostJpaEntity j WHERE j.status = 'PUBLISHED' AND j.deadline < :date")
        List<JobPostJpaEntity> findPublishedExpiredBefore(LocalDate date);

        /** Search cơ bản bằng PostgreSQL LIKE — thay bằng ES ở Sprint 5 */
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
}