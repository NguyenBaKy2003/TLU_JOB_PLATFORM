package edu.tlu.jobplatform.candidate.application.usecase.experience;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeleteExperienceUseCase {

    private final CandidateProfileRepository profileRepository;

    @Transactional
    public void execute(UUID userId, UUID experienceId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

        // removeExperience là no-op nếu id không tồn tại — không cần throw
        profile.removeExperience(experienceId);

        profileRepository.save(profile);
    }
}