package edu.tlu.jobplatform.cv.infrastructure.adapter;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.Education;
import edu.tlu.jobplatform.candidate.domain.model.WorkExperience;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Cross-domain adapter: CV domain → Candidate domain.
 *
 * CV domain KHÔNG được phép inject CandidateProfileRepository trực tiếp.
 * Adapter này (nằm trong cv/infrastructure) là nơi duy nhất được phép
 * cross domain boundary, sau đó chuyển đổi sang ProfileSnapshot
 * (DTO trung gian thuộc về cv domain) để tránh coupling.
 */
@Component
@RequiredArgsConstructor
public class CandidateProfileQueryAdapter implements CandidateProfileQueryPort {

    private final CandidateProfileRepository profileRepository;

    @Override
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
                mapExperiences(profile.getExperiences()),
                mapEducations(profile.getEducations()),
                mapSkills(profile),
                mapLanguages(profile));
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
                e.getDegree(),
                e.getMajor(),
                e.getStartDate(),
                e.getEndDate())).toList();
    }

    private List<String> mapSkills(CandidateProfile profile) {
        return profile.getSkills().stream()
                .map(s -> s.getName())
                .toList();
    }

    private List<LanguageItem> mapLanguages(CandidateProfile profile) {
        return profile.getLanguages().stream()
                .map(l -> new LanguageItem(l.getName(), l.getLevel().toString()))
                .toList();
    }
}