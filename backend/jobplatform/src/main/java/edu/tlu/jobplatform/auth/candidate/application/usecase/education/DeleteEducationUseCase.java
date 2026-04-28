package edu.tlu.jobplatform.auth.candidate.application.usecase.education;

import edu.tlu.jobplatform.auth.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.auth.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeleteEducationUseCase {

    private final CandidateProfileRepository profileRepository;

    @Transactional
    public void execute(UUID userId, UUID educationId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

        profile.removeEducation(educationId);

        profileRepository.save(profile);
    }
}