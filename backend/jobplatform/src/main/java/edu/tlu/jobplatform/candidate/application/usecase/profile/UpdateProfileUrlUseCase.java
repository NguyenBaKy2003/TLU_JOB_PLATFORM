package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.candidate.domain.service.ProfileUrlService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateProfileUrlUseCase {

    private final CandidateProfileRepository profileRepository;
    private final ProfileUrlService profileUrlService;

    @Transactional
    public CandidateProfile execute(UUID userId, String slug) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

        // Validate slug và build URL đầy đủ
        String newUrl = profileUrlService.validateAndBuildUrl(slug, profile.getId());

        profile.updateProfileUrl(newUrl);

        return profileRepository.save(profile);
    }
}