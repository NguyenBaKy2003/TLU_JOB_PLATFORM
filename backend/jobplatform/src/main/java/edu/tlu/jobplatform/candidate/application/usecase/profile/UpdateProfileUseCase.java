// ── UpdateProfileUseCase.java ─────────────────────────────────────
package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.candidate.domain.model.*;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.ContractType;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.Level;
import edu.tlu.jobplatform.candidate.domain.model.Language;
import edu.tlu.jobplatform.candidate.domain.model.SocialLink.Platform;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateProfileUseCase {

    private final CandidateProfileRepository profileRepository;

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
            int expectedSalary,
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

        // Basic info
        profile.updateBasicInfo(
                cmd.firstName(), cmd.lastName(),
                cmd.headline(), cmd.summary(), cmd.phone(),
                cmd.location(), cmd.dateOfBirth(), cmd.gender(),
                cmd.maritalStatus(), cmd.expectedSalary(), cmd.currency());

        // Skills
        if (cmd.skills() != null) {
            profile.replaceSkills(cmd.skills());
        }

        // Languages
        if (cmd.languages() != null) {
            cmd.languages().forEach(profile::addLanguage);
        }

        // Social links
        if (cmd.socialLinks() != null) {
            cmd.socialLinks().forEach(profile::addSocialLink);
        }

        // Desired job
        if (cmd.desiredJob() != null) {
            profile.updateDesiredJob(cmd.desiredJob());
        }

        // Benefits
        if (cmd.benefits() != null) {
            profile.replaceBenefits(cmd.benefits());
        }

        return profileRepository.save(profile);
    }
}