package edu.tlu.jobplatform.job.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.job.application.port.out.JobSearchPort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.infrastructure.persistence.entity.JobPostJpaEntity;
import edu.tlu.jobplatform.job.infrastructure.persistence.entity.JobPostSkillJpaEntity;
import edu.tlu.jobplatform.job.infrastructure.persistence.mapper.JobMapper;
import edu.tlu.jobplatform.job.infrastructure.persistence.repository.JobPostJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JobPostRepositoryAdapter implements JobPostRepository, JobSearchPort {

    private final JobPostJpaRepository jpaRepo;
    private final JobMapper mapper;

    @Override
    public Optional<JobPost> findById(UUID id) {
        return jpaRepo.findByIdWithSkills(id).map(mapper::toDomain);
    }

    @Override
    public Optional<JobPost> findBySlug(String slug) {
        return jpaRepo.findBySlugWithSkills(slug).map(mapper::toDomain);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return jpaRepo.existsBySlug(slug);
    }

    @Override
    public Page<JobPost> findByCompanyId(UUID companyId, Pageable p) {
        return jpaRepo.findByCompanyId(companyId, p).map(mapper::toDomain);
    }

    @Override
    public Page<JobPost> findByPostedBy(UUID postedBy, Pageable p) {
        return jpaRepo.findByPostedBy(postedBy, p).map(mapper::toDomain);
    }

    @Override
    public Page<JobPost> findPublished(Pageable p) {
        return jpaRepo.findByStatusAndIsActiveTrue(JobStatus.PUBLISHED, p).map(mapper::toDomain);
    }

    @Override
    public List<JobPost> findByStatusAndDeadlineBefore(JobStatus status, LocalDate date) {
        return jpaRepo.findByStatusAndDeadlineBefore(status, date)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<JobPost> findByStatus(JobStatus status, Pageable p) {
        return jpaRepo.findByStatus(status, p).map(mapper::toDomain);
    }

    @Override
    public JobPost save(JobPost job) {
        if (job.getId() != null) {
            Optional<JobPostJpaEntity> existing = jpaRepo.findById(job.getId());
            if (existing.isPresent()) {
                JobPostJpaEntity entity = existing.get();
                mapper.updateEntity(entity, job);
                syncSkills(entity, job);
                return mapper.toDomain(jpaRepo.save(entity));
            }
        }
        // Nhánh tạo mới — id đã được set trong toNewEntity
        JobPostJpaEntity entity = mapper.toNewEntity(job);
        syncSkills(entity, job);
        return mapper.toDomain(jpaRepo.save(entity));
    }

    /**
     * Đồng bộ danh sách skills giữa domain và JPA entity.
     * orphanRemoval=true → JPA tự xóa skill cũ khi clear().
     */
    private void syncSkills(JobPostJpaEntity entity, JobPost job) {
        entity.getSkills().clear();
        if (job.getSkills() != null && !job.getSkills().isEmpty()) {
            UUID jobPostId = job.getId();
            job.getSkills().forEach(skill -> {
                JobPostSkillJpaEntity skillEntity = mapper.toSkillEntity(skill, jobPostId);
                if (skillEntity.getId() == null) {
                    skillEntity.setId(UUID.randomUUID());
                }
                entity.getSkills().add(skillEntity);
            });
        }
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }

    @Override
    public Page<JobPost> search(String keyword, String city, String category,
            String jobType, String level, UUID companyId, Pageable pageable) {
        return jpaRepo.search(keyword, city, category, jobType, level, companyId, pageable)
                .map(mapper::toDomain);
    }
}