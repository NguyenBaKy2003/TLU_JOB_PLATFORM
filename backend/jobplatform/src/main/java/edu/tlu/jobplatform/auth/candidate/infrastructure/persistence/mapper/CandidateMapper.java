package edu.tlu.jobplatform.auth.candidate.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.auth.candidate.domain.model.*;
import edu.tlu.jobplatform.auth.candidate.infrastructure.persistence.entity.*;
import edu.tlu.jobplatform.user.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CandidateMapper {

        /**
         * Inject UserJpaRepository để lấy email khi map sang domain.
         *
         * Email nằm trong bảng users, không persist trong candidate_profiles.
         * Tất cả caller của toDomain() đều nhận CandidateProfile có email sẵn —
         * không cần workaround ở từng UseCase hay EventListener.
         */
        private final UserJpaRepository userJpaRepo;

        // ── CandidateProfile ──────────────────────────────────────────────────────

        public CandidateProfile toDomain(CandidateProfileJpaEntity e) {
                CandidateProfile profile = CandidateProfile.builder()
                                .id(e.getId())
                                .userId(e.getUserId())
                                .firstName(e.getFirstName())
                                .lastName(e.getLastName())
                                .headline(e.getHeadline())
                                .summary(e.getSummary())
                                .phone(e.getPhone())
                                .location(e.getLocation())
                                .postalCode(e.getPostalCode())
                                .avatarUrl(e.getAvatarUrl())
                                .dateOfBirth(e.getDateOfBirth())
                                .gender(e.getGender())
                                .maritalStatus(e.getMaritalStatus())
                                .profileUrl(e.getProfileUrl())
                                .jobSearchStatus(e.getJobSearchStatus())
                                .expectedSalary(e.getExpectedSalary())
                                .currency(e.getCurrency())
                                .skills(e.getSkills().stream()
                                                .map(this::toDomain)
                                                .collect(Collectors.toCollection(ArrayList::new)))
                                .experiences(e.getExperiences().stream()
                                                .map(this::toDomain)
                                                .collect(Collectors.toCollection(ArrayList::new)))
                                .educations(e.getEducations().stream()
                                                .map(this::toDomain)
                                                .collect(Collectors.toCollection(ArrayList::new)))
                                .languages(e.getLanguages().stream()
                                                .map(this::toDomain)
                                                .collect(Collectors.toCollection(ArrayList::new)))
                                .socialLinks(e.getSocialLinks().stream()
                                                .map(this::toDomain)
                                                .collect(Collectors.toCollection(ArrayList::new)))
                                .desiredJobs(e.getDesiredJobs().stream()
                                                .map(this::toDomain)
                                                .collect(Collectors.toCollection(ArrayList::new)))
                                .benefits(e.getBenefits().stream()
                                                .map(this::toDomain)
                                                .collect(Collectors.toCollection(ArrayList::new)))
                                .createdAt(e.getCreatedAt())
                                .updatedAt(e.getUpdatedAt())
                                .build();

                // Inject email từ bảng users — userId luôn có vì NOT NULL constraint
                userJpaRepo.findById(e.getUserId())
                                .ifPresent(u -> profile.setEmail(u.getEmail()));

                return profile;
        }

        public CandidateProfileJpaEntity toNewEntity(CandidateProfile p) {
                return CandidateProfileJpaEntity.builder()
                                .userId(p.getUserId())
                                .firstName(p.getFirstName())
                                .lastName(p.getLastName())
                                .headline(p.getHeadline())
                                .summary(p.getSummary())
                                .phone(p.getPhone())
                                .location(p.getLocation())
                                .postalCode(p.getPostalCode())
                                .avatarUrl(p.getAvatarUrl())
                                .dateOfBirth(p.getDateOfBirth())
                                .gender(p.getGender())
                                .maritalStatus(p.getMaritalStatus())
                                .profileUrl(p.getProfileUrl())
                                .jobSearchStatus(p.getJobSearchStatus())
                                .expectedSalary(p.getExpectedSalary())
                                .currency(p.getCurrency())
                                .build();
        }

        public void updateEntity(CandidateProfileJpaEntity e, CandidateProfile p) {
                e.setFirstName(p.getFirstName());
                e.setLastName(p.getLastName());
                e.setHeadline(p.getHeadline());
                e.setSummary(p.getSummary());
                e.setPhone(p.getPhone());
                e.setLocation(p.getLocation());
                e.setPostalCode(p.getPostalCode());
                e.setAvatarUrl(p.getAvatarUrl());
                e.setDateOfBirth(p.getDateOfBirth());
                e.setGender(p.getGender());
                e.setMaritalStatus(p.getMaritalStatus());
                e.setProfileUrl(p.getProfileUrl());
                e.setJobSearchStatus(p.getJobSearchStatus());
                e.setExpectedSalary(p.getExpectedSalary());
                e.setCurrency(p.getCurrency());

                // Skills — dedup theo name (case-insensitive) trước khi insert
                e.getSkills().clear();
                p.getSkills().stream()
                                .filter(distinctByName())
                                .map(this::toEmbeddable)
                                .forEach(e.getSkills()::add);

                // Languages — replace toàn bộ
                e.getLanguages().clear();
                p.getLanguages().stream()
                                .map(lang -> toEntity(lang, e))
                                .forEach(e.getLanguages()::add);

                // Social links — replace toàn bộ
                e.getSocialLinks().clear();
                p.getSocialLinks().stream()
                                .map(link -> toEntity(link, e))
                                .forEach(e.getSocialLinks()::add);

                // Experiences — replace toàn bộ
                e.getExperiences().clear();
                p.getExperiences().stream()
                                .map(exp -> toEntity(exp, e))
                                .forEach(e.getExperiences()::add);

                // Educations — replace toàn bộ
                e.getEducations().clear();
                p.getEducations().stream()
                                .map(edu -> toEntity(edu, e))
                                .forEach(e.getEducations()::add);

                // Desired jobs — replace toàn bộ
                e.getDesiredJobs().clear();
                p.getDesiredJobs().stream()
                                .map(job -> toEntity(job, e))
                                .forEach(e.getDesiredJobs()::add);

                // Benefits — replace toàn bộ
                e.getBenefits().clear();
                p.getBenefits().stream()
                                .map(benefit -> toEntity(benefit, e))
                                .forEach(e.getBenefits()::add);
        }

        // ── WorkExperience ────────────────────────────────────────────────────────

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

        public WorkExperienceJpaEntity toEntity(WorkExperience w, CandidateProfileJpaEntity profile) {
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

        // ── Education ─────────────────────────────────────────────────────────────

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

        public EducationJpaEntity toEntity(Education edu, CandidateProfileJpaEntity profile) {
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

        // ── Skill ──

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

        // ── Language ──────────────────────────────────────────────────────────────

        public Language toDomain(LanguageJpaEntity e) {
                return Language.builder()
                                .id(e.getId())
                                .name(e.getName())
                                .level(e.getLevel())
                                .build();
        }

        public LanguageJpaEntity toEntity(Language l, CandidateProfileJpaEntity profile) {
                return LanguageJpaEntity.builder()
                                .profile(profile)
                                .name(l.getName())
                                .level(l.getLevel())
                                .build();
        }

        // ── SocialLink ────────────────────────────────────────────────────────────

        public SocialLink toDomain(SocialLinkJpaEntity e) {
                return SocialLink.builder()
                                .id(e.getId())
                                .platform(e.getPlatform())
                                .url(e.getUrl())
                                .build();
        }

        public SocialLinkJpaEntity toEntity(SocialLink l, CandidateProfileJpaEntity profile) {
                return SocialLinkJpaEntity.builder()
                                .profile(profile)
                                .platform(l.getPlatform())
                                .url(l.getUrl())
                                .build();
        }

        // ── DesiredJob ────────────────────────────────────────────────────────────

        public DesiredJob toDomain(DesiredJobJpaEntity e) {
                return DesiredJob.builder()
                                .id(e.getId())
                                .industry(e.getIndustry())
                                .minSalary(e.getMinSalary())
                                .currency(e.getCurrency())
                                .contractTypes(new ArrayList<>(e.getContractTypes()))
                                .levels(new ArrayList<>(e.getLevels()))
                                .build();
        }

        public DesiredJobJpaEntity toEntity(DesiredJob j, CandidateProfileJpaEntity profile) {
                return DesiredJobJpaEntity.builder()
                                .profile(profile)
                                .industry(j.getIndustry())
                                .minSalary(j.getMinSalary())
                                .currency(j.getCurrency())
                                .contractTypes(new ArrayList<>(j.getContractTypes()))
                                .levels(new ArrayList<>(j.getLevels()))
                                .build();
        }

        // ── Benefit

        public Benefit toDomain(BenefitJpaEntity e) {
                return Benefit.builder()
                                .id(e.getId())
                                .name(e.getName())
                                .build();
        }

        public BenefitJpaEntity toEntity(Benefit b, CandidateProfileJpaEntity profile) {
                return BenefitJpaEntity.builder()
                                .profile(profile)
                                .name(b.getName())
                                .build();
        }

        // ── CandidateCV ───────────────────────────────────────────────────────────

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

        // ── Private utils ─────────────────────────────────────────────────────────

        /**
         * Stateful predicate — giữ lại phần tử đầu tiên theo name (case-insensitive).
         * Dùng như safety net ở tầng persistence; dedup chính vẫn nên ở domain/usecase.
         */
        private static java.util.function.Predicate<Skill> distinctByName() {
                Set<String> seen = new LinkedHashSet<>();
                return s -> seen.add(s.getName().toLowerCase());
        }
}