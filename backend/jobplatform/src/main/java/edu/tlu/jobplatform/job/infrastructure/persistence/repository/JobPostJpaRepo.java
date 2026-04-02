package edu.tlu.jobplatform.job.infrastructure.persistence.repository;

import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.infrastructure.persistence.entity.JobPostJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobPostJpaRepo
        extends JpaRepository<JobPostJpaEntity, UUID>, JpaSpecificationExecutor<JobPostJpaEntity> {

    List<JobPostJpaEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

    List<JobPostJpaEntity> findByCompanyIdAndStatusOrderByCreatedAtDesc(UUID companyId, JobStatus status);

    List<JobPostJpaEntity> findByStatusAndDeadlineBefore(JobStatus status, LocalDateTime threshold);

    @Query("SELECT j FROM JobPostJpaEntity j WHERE j.featured = true AND j.status = 'PUBLISHED' ORDER BY j.publishedAt DESC")
    List<JobPostJpaEntity> findFeaturedAndPublished();

    @Query("SELECT j FROM JobPostJpaEntity j WHERE j.companyId = :companyId AND j.status = 'PUBLISHED' ORDER BY j.publishedAt DESC")
    List<JobPostJpaEntity> findPublishedByCompanyId(UUID companyId);
}