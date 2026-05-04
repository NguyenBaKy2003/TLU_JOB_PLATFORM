package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.JobSearchStatus;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateJobSearchStatusUseCase {

    private final CandidateProfileRepository profileRepository;

    @Transactional
    public void execute(UUID userId, JobSearchStatus status) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

        profile.updateJobSearchStatus(status);
        profileRepository.save(profile);
    }
}