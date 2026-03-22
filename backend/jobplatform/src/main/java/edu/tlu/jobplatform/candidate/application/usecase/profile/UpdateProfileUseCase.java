package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.candidate.domain.model.*;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UpdateProfileUseCase {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository; // ← thêm để inject email

    public record Command(
            UUID userId,
            String firstName,
            String lastName,
            String headline,
            String summary,
            String phone,
            String location,
            LocalDate dateOfBirth,
            String gender,
            String maritalStatus,
            Integer expectedSalary,
            String currency,
            List<Skill> skills,
            List<Language> languages,
            List<SocialLink> socialLinks,
            DesiredJob desiredJob,
            List<Benefit> benefits) {
    }

    @Transactional
    public CandidateProfile execute(Command cmd) {
        CandidateProfile profile = profileRepository.findByUserId(cmd.userId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

        // Basic info — patch semantics (null = không đổi)
        profile.patchBasicInfo(
                cmd.firstName(), cmd.lastName(),
                cmd.headline(), cmd.summary(),
                cmd.phone(), cmd.location(),
                cmd.dateOfBirth(), cmd.gender(), cmd.maritalStatus(),
                cmd.expectedSalary(), cmd.currency());

        if (cmd.skills() != null)
            profile.replaceSkills(deduplicateSkills(cmd.skills()));
        if (cmd.languages() != null)
            profile.replaceLanguages(cmd.languages());
        if (cmd.socialLinks() != null)
            profile.replaceSocialLinks(cmd.socialLinks());
        if (cmd.desiredJob() != null)
            profile.updateDesiredJob(cmd.desiredJob());
        if (cmd.benefits() != null)
            profile.replaceBenefits(cmd.benefits());

        CandidateProfile saved = profileRepository.save(profile);

        // ── Inject email sau khi save ─────────────────────────────────────────
        // Email không lưu trong candidate_profiles → mapper.toDomain() không có email
        // → phải inject lại từ users table, giống GetProfileUseCase
        userRepository.findById(cmd.userId())
                .ifPresent(user -> saved.setEmail(user.getEmail()));

        return saved;
    }

    private static List<Skill> deduplicateSkills(List<Skill> skills) {
        if (skills == null || skills.isEmpty())
            return Collections.emptyList();
        Map<String, Skill> seen = new LinkedHashMap<>();
        for (Skill s : skills)
            seen.putIfAbsent(s.getName().toLowerCase(Locale.ROOT), s);
        return new ArrayList<>(seen.values());
    }
}