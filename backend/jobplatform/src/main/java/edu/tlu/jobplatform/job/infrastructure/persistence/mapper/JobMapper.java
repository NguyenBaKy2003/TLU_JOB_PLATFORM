package edu.tlu.jobplatform.job.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.JobPostSkill;
import edu.tlu.jobplatform.job.domain.model.SavedJob;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.job.infrastructure.persistence.entity.JobPostJpaEntity;
import edu.tlu.jobplatform.job.infrastructure.persistence.entity.JobPostSkillJpaEntity;
import edu.tlu.jobplatform.job.infrastructure.persistence.entity.SavedJobJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class JobMapper {

    // ── JobPost ───

    public JobPost toDomain(JobPostJpaEntity e) {
        if (e == null)
            return null;

        Salary salary = buildSalary(e);
        WorkLocation loc = buildWorkLocation(e);

        List<JobPostSkill> skills = e.getSkills() == null ? new ArrayList<>()
                : e.getSkills().stream().map(this::toSkillDomain).toList();

        return JobPost.builder()
                .id(e.getId())
                .companyId(e.getCompanyId())
                .postedBy(e.getPostedBy())
                .title(e.getTitle())
                .slug(e.getSlug())
                .description(e.getDescription())
                .requirements(e.getRequirements())
                .benefits(e.getBenefits())
                .jobType(e.getJobType())
                .level(e.getLevel())
                .category(e.getCategory())
                .salary(salary)
                .workLocation(loc)
                .experienceYears(e.getExperienceYears())
                .vacancies(e.getVacancies())
                .deadline(e.getDeadline())
                .publishedAt(e.getPublishedAt())
                .closedAt(e.getClosedAt())
                .expiredAt(e.getExpiredAt())
                .featured(e.isFeatured())
                .status(e.getStatus())
                .viewCount(e.getViewCount())
                .applicationCount(e.getApplicationCount())
                .skills(skills)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public JobPostJpaEntity toNewEntity(JobPost d) {
        JobPostJpaEntity e = JobPostJpaEntity.builder()
                .companyId(d.getCompanyId())
                .postedBy(d.getPostedBy())
                .title(d.getTitle())
                .slug(d.getSlug())
                .description(d.getDescription())
                .requirements(d.getRequirements())
                .benefits(d.getBenefits())
                .jobType(d.getJobType())
                .level(d.getLevel())
                .category(d.getCategory())
                .experienceYears(d.getExperienceYears())
                .vacancies(d.getVacancies())
                .deadline(d.getDeadline())
                .publishedAt(d.getPublishedAt())
                .closedAt(d.getClosedAt())
                .expiredAt(d.getExpiredAt())
                .featured(d.isFeatured())
                .status(d.getStatus())
                .viewCount(d.getViewCount())
                .applicationCount(d.getApplicationCount())
                .build();

        e.setId(d.getId());
        applySalary(e, d.getSalary());
        applyWorkLocation(e, d.getWorkLocation());
        return e;
    }

    public void updateEntity(JobPostJpaEntity e, JobPost d) {
        e.setTitle(d.getTitle());
        e.setSlug(d.getSlug());
        e.setDescription(d.getDescription());
        e.setRequirements(d.getRequirements());
        e.setBenefits(d.getBenefits());
        e.setJobType(d.getJobType());
        e.setLevel(d.getLevel());
        e.setCategory(d.getCategory());
        e.setExperienceYears(d.getExperienceYears());
        e.setVacancies(d.getVacancies());
        e.setDeadline(d.getDeadline());
        e.setPublishedAt(d.getPublishedAt());
        e.setClosedAt(d.getClosedAt());
        e.setExpiredAt(d.getExpiredAt());
        e.setFeatured(d.isFeatured());
        e.setStatus(d.getStatus());
        e.setViewCount(d.getViewCount());
        e.setApplicationCount(d.getApplicationCount());
        applySalary(e, d.getSalary());
        applyWorkLocation(e, d.getWorkLocation());
    }

    // ── Salary helpers ────────────────────────────────────────

    private Salary buildSalary(JobPostJpaEntity e) {
        if (Boolean.TRUE.equals(e.getSalaryNegotiable()))
            return Salary.negotiable();
        if (e.getSalaryMin() == null && e.getSalaryMax() == null)
            return null;
        return Salary.of(e.getSalaryMin(), e.getSalaryMax(), e.getSalaryCurrency());
    }

    private void applySalary(JobPostJpaEntity e, Salary s) {
        if (s == null)
            return;
        e.setSalaryMin(s.getMin());
        e.setSalaryMax(s.getMax());
        e.setSalaryCurrency(s.getCurrency());
        e.setSalaryNegotiable(s.isNegotiable());
    }

    // ── WorkLocation helpers ──────────────────────────────────

    private WorkLocation buildWorkLocation(JobPostJpaEntity e) {
        if (e.getWorkLocationType() == null)
            return null;
        return WorkLocation.builder()
                .type(WorkLocation.LocationType.valueOf(e.getWorkLocationType()))
                .city(e.getWorkLocationCity())
                .address(e.getWorkLocationAddress())
                .build();
    }

    private void applyWorkLocation(JobPostJpaEntity e, WorkLocation loc) {
        if (loc == null)
            return;
        e.setWorkLocationType(loc.getType().name());
        e.setWorkLocationCity(loc.getCity());
        e.setWorkLocationAddress(loc.getAddress());
    }

    // ── Skill ─────

    public JobPostSkill toSkillDomain(JobPostSkillJpaEntity e) {
        return JobPostSkill.builder()
                .id(e.getId())
                .jobPostId(e.getJobPostId())
                .skillName(e.getSkillName())
                .level(e.getLevel())
                .required(e.isRequired())
                .build();
    }

    public JobPostSkillJpaEntity toSkillEntity(JobPostSkill d, UUID jobPostId) {
        return JobPostSkillJpaEntity.builder()
                .id(d.getId())
                .jobPostId(jobPostId)
                .skillName(d.getSkillName())
                .level(d.getLevel())
                .required(d.isRequired())
                .build();
    }

    // ── SavedJob ──

    public SavedJob toSavedJobDomain(SavedJobJpaEntity e) {
        return SavedJob.builder()
                .id(e.getId())
                .candidateId(e.getCandidateId())
                .jobPostId(e.getJobPostId())
                .savedAt(e.getSavedAt())
                .build();
    }

    public SavedJobJpaEntity toSavedJobEntity(SavedJob d) {
        return SavedJobJpaEntity.builder()
                .candidateId(d.getCandidateId())
                .jobPostId(d.getJobPostId())
                .savedAt(d.getSavedAt())
                .build();
    }
}