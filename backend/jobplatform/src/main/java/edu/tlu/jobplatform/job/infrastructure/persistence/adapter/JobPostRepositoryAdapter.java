package edu.tlu.jobplatform.job.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.infrastructure.persistence.entity.JobPostJpaEntity;
import edu.tlu.jobplatform.job.infrastructure.persistence.mapper.JobMapper;
import edu.tlu.jobplatform.job.infrastructure.persistence.repository.JobPostJpaRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JobPostRepositoryAdapter implements JobPostRepository {

    private final JobPostJpaRepo jpaRepo;
    private final JobMapper mapper;

    @Override
    public Optional<JobPost> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<JobPost> findByCompanyId(UUID companyId) {
        return jpaRepo.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<JobPost> findPublishedByCompanyId(UUID companyId) {
        return jpaRepo.findPublishedByCompanyId(companyId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<JobPost> findByStatusAndDeadlineBefore(JobStatus status, LocalDateTime threshold) {
        return jpaRepo.findByStatusAndDeadlineBefore(status, threshold)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<JobPost> findFeaturedAndPublished() {
        return jpaRepo.findFeaturedAndPublished()
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public JobPost save(JobPost job) {
        JobPostJpaEntity entity = jpaRepo.findById(job.getId())
                .map(e -> {
                    mapper.updateEntity(e, job);
                    return e;
                })
                .orElseGet(() -> mapper.toNewEntity(job));
        return mapper.toDomain(jpaRepo.save(entity));
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}