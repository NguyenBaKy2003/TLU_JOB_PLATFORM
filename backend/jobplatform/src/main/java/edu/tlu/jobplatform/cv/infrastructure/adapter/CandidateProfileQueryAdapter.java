package edu.tlu.jobplatform.cv.infrastructure.adapter;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.Education;
import edu.tlu.jobplatform.candidate.domain.model.Language;
import edu.tlu.jobplatform.candidate.domain.model.Skill;
import edu.tlu.jobplatform.candidate.domain.model.SocialLink;
import edu.tlu.jobplatform.candidate.domain.model.WorkExperience;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

/**
 * Adapter đọc CandidateProfile trong transaction RIÊNG BIỆT (REQUIRES_NEW)
 * để tránh Hibernate dirty-check ElementCollection (candidate_skills)
 * khi flush trong transaction của use-case cha.
 */
@Component
@RequiredArgsConstructor
public class CandidateProfileQueryAdapter implements CandidateProfileQueryPort {

    private final CandidateProfileRepository profileRepository;

    @Override
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    public ProfileSnapshot getProfileSnapshot(UUID candidateId) {
        CandidateProfile profile = profileRepository.findByUserId(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hồ sơ ứng viên.", "PROFILE_NOT_FOUND"));

        return new ProfileSnapshot(
                buildFullName(profile),
                profile.getEmail(),
                profile.getPhone(),
                profile.getHeadline(),
                profile.getSummary(),
                profile.getLocation(),
                profile.getAvatarUrl(),
                mapExperiences(dedup(profile.getExperiences())),
                mapEducations(dedup(profile.getEducations())),
                mapSkills(dedup(profile.getSkills())),
                mapLanguages(dedup(profile.getLanguages())),
                mapSocialLinks(dedup(profile.getSocialLinks())));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Loại bỏ trùng lặp, giữ thứ tự insertion. */
    private static <T> List<T> dedup(Collection<T> col) {
        if (col == null || col.isEmpty())
            return List.of();
        return List.copyOf(new LinkedHashSet<>(col));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private String buildFullName(CandidateProfile p) {
        String first = p.getFirstName() != null ? p.getFirstName() : "";
        String last = p.getLastName() != null ? p.getLastName() : "";
        return (first + " " + last).trim();
    }

    private List<ExperienceItem> mapExperiences(List<WorkExperience> list) {
        return list.stream().map(e -> new ExperienceItem(
                e.getCompanyName(),
                e.getPosition(),
                e.getDescription(),
                e.getStartDate(),
                e.getEndDate(),
                e.isCurrent())).toList();
    }

    private List<EducationItem> mapEducations(List<Education> list) {
        return list.stream().map(e -> new EducationItem(
                e.getSchool(),
                e.getDegree() != null ? e.getDegree().toString() : null,
                e.getMajor(),
                e.getStartDate(),
                e.getEndDate())).toList();
    }

    private List<SkillItem> mapSkills(List<Skill> list) {
        return list.stream()
                .map(s -> new SkillItem(
                        s.getName(),
                        s.getLevel() != null ? s.getLevel().toString() : null,
                        s.getYearsOfExp()))
                .toList();
    }

    private List<LanguageItem> mapLanguages(List<Language> list) {
        return list.stream()
                .map(l -> new LanguageItem(
                        l.getName(),
                        l.getLevel() != null ? l.getLevel().toString() : null))
                .toList();
    }

    private List<SocialLinkItem> mapSocialLinks(List<SocialLink> list) {
        return list.stream()
                .map(s -> new SocialLinkItem(
                        s.getPlatform() != null ? s.getPlatform().toString() : null,
                        s.getUrl()))
                .toList();
    }
}