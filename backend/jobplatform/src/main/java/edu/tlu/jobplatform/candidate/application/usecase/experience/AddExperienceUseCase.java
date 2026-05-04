package edu.tlu.jobplatform.candidate.application.usecase.experience;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.WorkExperience;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddExperienceUseCase {

    private final CandidateProfileRepository profileRepository;

    @Transactional
    public CandidateProfile execute(UUID userId, WorkExperience experience) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

        profile.addExperience(experience);

        return profileRepository.save(profile);
    }
}