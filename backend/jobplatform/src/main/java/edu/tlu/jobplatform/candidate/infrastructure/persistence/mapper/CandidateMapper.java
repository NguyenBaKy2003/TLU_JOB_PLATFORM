package edu.tlu.jobplatform.candidate.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.candidate.domain.model.*;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.entity.*;
import org.springframework.stereotype.Component;

@Component
public class CandidateMapper {

    // ── CandidateProfile ──────────────────────────────────────────

    public CandidateProfile toDomain(CandidateProfileJpaEntity e) {
        return CandidateProfile.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .headline(e.getHeadline())
                .summary(e.getSummary())
                .phone(e.getPhone())
                .location(e.getLocation())
                .avatarUrl(e.getAvatarUrl())
                .dateOfBirth(e.getDateOfBirth())
                .gender(e.getGender())
                .jobSearchStatus(e.getJobSearchStatus())
                .expectedSalary(e.getExpectedSalary())
                .currency(e.getCurrency())
                .experiences(e.getExperiences().stream()
                        .map(this::toDomain).toList())
                .educations(e.getEducations().stream()
                        .map(this::toDomain).toList())
                .skills(e.getSkills().stream()
                        .map(this::toDomain).toList())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public CandidateProfileJpaEntity toNewEntity(CandidateProfile p) {
        return CandidateProfileJpaEntity.builder()
                .userId(p.getUserId())
                .headline(p.getHeadline())
                .summary(p.getSummary())
                .phone(p.getPhone())
                .location(p.getLocation())
                .avatarUrl(p.getAvatarUrl())
                .dateOfBirth(p.getDateOfBirth())
                .gender(p.getGender())
                .jobSearchStatus(p.getJobSearchStatus())
                .expectedSalary(p.getExpectedSalary())
                .currency(p.getCurrency())
                .build();
    }

    public void updateEntity(CandidateProfileJpaEntity e, CandidateProfile p) {
        e.setHeadline(p.getHeadline());
        e.setSummary(p.getSummary());
        e.setPhone(p.getPhone());
        e.setLocation(p.getLocation());
        e.setAvatarUrl(p.getAvatarUrl());
        e.setDateOfBirth(p.getDateOfBirth());
        e.setGender(p.getGender());
        e.setJobSearchStatus(p.getJobSearchStatus());
        e.setExpectedSalary(p.getExpectedSalary());
        e.setCurrency(p.getCurrency());

        // Sync skills (embeddable — xóa + insert lại)
        e.getSkills().clear();
        p.getSkills().stream()
                .map(this::toEmbeddable)
                .forEach(e.getSkills()::add);

        // Sync experiences
        e.getExperiences().clear();
        p.getExperiences().stream()
                .map(exp -> toEntity(exp, e))
                .forEach(e.getExperiences()::add);

        // Sync educations
        e.getEducations().clear();
        p.getEducations().stream()
                .map(edu -> toEntity(edu, e))
                .forEach(e.getEducations()::add);
    }

    // ── WorkExperience ────────────────────────────────────────────

    public WorkExperience toDomain(WorkExperienceJpaEntity e) {
        return WorkExperience.builder()
                .id(e.getId())
                .companyName(e.getCompanyName())
                .position(e.getPosition())
                .description(e.getDescription())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .current(e.isCurrent())
                .build();
    }

    public WorkExperienceJpaEntity toEntity(WorkExperience w,
            CandidateProfileJpaEntity profile) {
        return WorkExperienceJpaEntity.builder()
                .profile(profile)
                .companyName(w.getCompanyName())
                .position(w.getPosition())
                .description(w.getDescription())
                .startDate(w.getStartDate())
                .endDate(w.getEndDate())
                .current(w.isCurrent())
                .build();
    }

    // ── Education ─────────────────────────────────────────────────

    public Education toDomain(EducationJpaEntity e) {
        return Education.builder()
                .id(e.getId())
                .school(e.getSchool())
                .major(e.getMajor())
                .degree(e.getDegree())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .description(e.getDescription())
                .build();
    }

    public EducationJpaEntity toEntity(Education edu,
            CandidateProfileJpaEntity profile) {
        return EducationJpaEntity.builder()
                .profile(profile)
                .school(edu.getSchool())
                .major(edu.getMajor())
                .degree(edu.getDegree())
                .startDate(edu.getStartDate())
                .endDate(edu.getEndDate())
                .description(edu.getDescription())
                .build();
    }

    // ── Skill ─────────────────────────────────────────────────────

    public Skill toDomain(SkillEmbeddable e) {
        return Skill.of(e.getName(), e.getLevel(), e.getYearsOfExp());
    }

    public SkillEmbeddable toEmbeddable(Skill s) {
        return SkillEmbeddable.builder()
                .name(s.getName())
                .level(s.getLevel())
                .yearsOfExp(s.getYearsOfExp())
                .build();
    }

    // ── CandidateCV ───────────────────────────────────────────────

    public CandidateCV toDomain(CandidateCVJpaEntity e) {
        return CandidateCV.builder()
                .id(e.getId())
                .candidateId(e.getCandidateId())
                .title(e.getTitle())
                .type(e.getType())
                .fileUrl(e.getFileUrl())
                .parsedContent(e.getParsedContent())
                .primary(e.isPrimary())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public CandidateCVJpaEntity toNewEntity(CandidateCV cv) {
        return CandidateCVJpaEntity.builder()
                .candidateId(cv.getCandidateId())
                .title(cv.getTitle())
                .type(cv.getType())
                .fileUrl(cv.getFileUrl())
                .parsedContent(cv.getParsedContent())
                .primary(cv.isPrimary())
                .build();
    }

    public void updateCVEntity(CandidateCVJpaEntity e, CandidateCV cv) {
        e.setTitle(cv.getTitle());
        e.setPrimary(cv.isPrimary());
        e.setParsedContent(cv.getParsedContent());
    }
}