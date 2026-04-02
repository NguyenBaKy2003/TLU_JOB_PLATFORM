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

@Component
public class JobMapper {

    // ── JobPost ───────────────────────────────────────────────

    public JobPost toDomain(JobPostJpaEntity e) {
        if (e == null)
            return null;

        Salary salary = e.isSalaryNegotiate()
                ? Salary.negotiate()
                : Salary.of(e.getSalaryMin(), e.getSalaryMax(), e.getSalaryCurrency());

        WorkLocation workLocation = e.getWorkLocationType() == null ? null
                : WorkLocation.builder()
                        .type(e.getWorkLocationType())
                        .city(e.getWorkLocationCity())
                        .district(e.getWorkLocationDistrict())
                        .address(e.getWorkLocationAddress())
                        .build();

        List<JobPostSkill> skills = e.getSkills() == null ? new ArrayList<>()
                : e.getSkills().stream().map(this::toSkillDomain).toList();

        return JobPost.builder()
                .id(e.getId())
                .companyId(e.getCompanyId())
                .title(e.getTitle())
                .description(e.getDescription())
                .requirements(e.getRequirements())
                .benefits(e.getBenefits())
                .categoryCode(e.getCategoryCode())
                .level(e.getLevel())
                .jobType(e.getJobType())
                .headcount(e.getHeadcount())
                .salary(salary)
                .workLocation(workLocation)
                .status(e.getStatus())
                .featured(e.isFeatured())
                .viewCount(e.getViewCount())
                .deadline(e.getDeadline())
                .publishedAt(e.getPublishedAt())
                .closedAt(e.getClosedAt())
                .skills(skills)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public JobPostJpaEntity toNewEntity(JobPost d) {
        JobPostJpaEntity entity = JobPostJpaEntity.builder()
                .companyId(d.getCompanyId())
                .title(d.getTitle())
                .description(d.getDescription())
                .requirements(d.getRequirements())
                .benefits(d.getBenefits())
                .categoryCode(d.getCategoryCode())
                .level(d.getLevel())
                .jobType(d.getJobType())
                .headcount(d.getHeadcount())
                .status(d.getStatus())
                .featured(d.isFeatured())
                .viewCount(d.getViewCount())
                .deadline(d.getDeadline())
                .publishedAt(d.getPublishedAt())
                .closedAt(d.getClosedAt())
                .build();

        applySalary(entity, d.getSalary());
        applyWorkLocation(entity, d.getWorkLocation());
        entity.setId(d.getId());
        return entity;
    }

    public void updateEntity(JobPostJpaEntity e, JobPost d) {
        e.setTitle(d.getTitle());
        e.setDescription(d.getDescription());
        e.setRequirements(d.getRequirements());
        e.setBenefits(d.getBenefits());
        e.setCategoryCode(d.getCategoryCode());
        e.setLevel(d.getLevel());
        e.setJobType(d.getJobType());
        e.setHeadcount(d.getHeadcount());
        e.setStatus(d.getStatus());
        e.setFeatured(d.isFeatured());
        e.setViewCount(d.getViewCount());
        e.setDeadline(d.getDeadline());
        e.setPublishedAt(d.getPublishedAt());
        e.setClosedAt(d.getClosedAt());
        applySalary(e, d.getSalary());
        applyWorkLocation(e, d.getWorkLocation());

        // Sync skills
        e.getSkills().clear();
        if (d.getSkills() != null) {
            d.getSkills().stream()
                    .map(s -> toSkillEntity(s, e))
                    .forEach(e.getSkills()::add);
        }
    }

    // ── JobPostSkill ──────────────────────────────────────────

    public JobPostSkill toSkillDomain(JobPostSkillJpaEntity e) {
        return JobPostSkill.builder()
                .id(e.getId())
                .jobPostId(e.getJobPost().getId())
                .skillName(e.getSkillName())
                .required(e.isRequired())
                .yearsRequired(e.getYearsRequired())
                .build();
    }

    public JobPostSkillJpaEntity toSkillEntity(JobPostSkill d, JobPostJpaEntity jobEntity) {
        return JobPostSkillJpaEntity.builder()
                .jobPost(jobEntity)
                .skillName(d.getSkillName())
                .required(d.isRequired())
                .yearsRequired(d.getYearsRequired())
                .build();
    }

    // ── SavedJob ──────────────────────────────────────────────

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
                .id(d.getId())
                .candidateId(d.getCandidateId())
                .jobPostId(d.getJobPostId())
                .build();
    }

    // ── Private helpers ───────────────────────────────────────

    private void applySalary(JobPostJpaEntity e, Salary s) {
        if (s == null)
            return;
        e.setSalaryNegotiate(s.isNegotiate());
        e.setSalaryMin(s.getMin());
        e.setSalaryMax(s.getMax());
        e.setSalaryCurrency(s.getCurrency());
    }

    private void applyWorkLocation(JobPostJpaEntity e, WorkLocation wl) {
        if (wl == null)
            return;
        e.setWorkLocationType(wl.getType());
        e.setWorkLocationCity(wl.getCity());
        e.setWorkLocationDistrict(wl.getDistrict());
        e.setWorkLocationAddress(wl.getAddress());
    }
}