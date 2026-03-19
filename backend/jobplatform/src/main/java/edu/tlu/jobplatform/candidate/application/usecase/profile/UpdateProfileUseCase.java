package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.Skill;
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
            String headline,
            String summary,
            String phone,
            String location,
            LocalDate dateOfBirth,
            String gender,
            int expectedSalary,
            String currency,
            List<Skill> skills) {
    }

    @Transactional
    public CandidateProfile execute(Command cmd) {
        CandidateProfile profile = profileRepository.findByUserId(cmd.userId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

        profile.updateBasicInfo(
                cmd.headline(), cmd.summary(), cmd.phone(),
                cmd.location(), cmd.dateOfBirth(), cmd.gender(),
                cmd.expectedSalary(), cmd.currency());

        if (cmd.skills() != null) {
            profile.replaceSkills(cmd.skills());
        }

        return profileRepository.save(profile);
    }
}