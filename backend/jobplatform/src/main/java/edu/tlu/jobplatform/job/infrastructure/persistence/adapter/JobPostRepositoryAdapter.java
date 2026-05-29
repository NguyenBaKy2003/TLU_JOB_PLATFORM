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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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
    public Page<JobPost> findByCompanyIdAndStatus(UUID companyId, JobStatus status, Pageable p) {
        return jpaRepo.findByCompanyIdAndStatus(companyId, status, p).map(mapper::toDomain);
    }

    @Override
    public Page<JobPost> findByPostedBy(UUID postedBy, Pageable p) {
        return jpaRepo.findByPostedBy(postedBy, p).map(mapper::toDomain);
    }

    @Override
    public Page<JobPost> searchMyJobs(UUID postedBy, JobStatus status, String keyword,
            LocalDateTime createdAtFrom, LocalDateTime createdAtTo, Pageable pageable) {
        return jpaRepo.searchMyJobs(postedBy, status, keyword, createdAtFrom, createdAtTo, pageable)
                .map(mapper::toDomain);
    }

    /**
     * Gọi một query GROUP BY nhẹ — không load entity, không phân trang.
     * Chỉ trả về Map<status, count> cho các status có ít nhất 1 bài.
     */
    @Override
    public Map<JobStatus, Long> countMyJobsByStatus(UUID postedBy) {
        return jpaRepo.countMyJobsByStatus(postedBy)
                .stream()
                .collect(Collectors.toMap(
                        p -> p.getStatus(),
                        p -> p.getCount(),
                        (a, b) -> a, // merge function (không xảy ra, GROUP BY đảm bảo unique)
                        () -> new EnumMap<>(JobStatus.class)));
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
    public List<JobPost> findAllById(Collection<UUID> ids) {
        return jpaRepo.findAllById(ids).stream()
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
        JobPostJpaEntity entity = mapper.toNewEntity(job);
        syncSkills(entity, job);
        return mapper.toDomain(jpaRepo.save(entity));
    }

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
    public Page<JobPost> search(
            String keyword, String city, String category, UUID companyId,
            String workLocType, String currency,
            BigDecimal minSalary, BigDecimal maxSalary,
            LocalDateTime postedAfter,
            List<String> jobTypes, List<String> levels,
            Pageable pageable) {

        String currencyParam = (currency != null && !currency.isBlank())
                ? currency.toUpperCase()
                : null;

        String[] jobTypesArr = (jobTypes == null || jobTypes.isEmpty())
                ? null
                : jobTypes.toArray(String[]::new);
        String[] levelsArr = (levels == null || levels.isEmpty())
                ? null
                : levels.toArray(String[]::new);

        return jpaRepo.search(
                keyword, city, category, companyId,
                workLocType, currencyParam,
                minSalary, maxSalary, postedAfter,
                jobTypesArr, levelsArr,
                pageable)
                .map(mapper::toDomain);
    }
}