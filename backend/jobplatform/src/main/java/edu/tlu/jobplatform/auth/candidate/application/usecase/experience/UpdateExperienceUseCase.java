package edu.tlu.jobplatform.auth.candidate.application.usecase.experience;

import edu.tlu.jobplatform.auth.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.auth.candidate.domain.model.WorkExperience;
import edu.tlu.jobplatform.auth.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateExperienceUseCase {

        private final CandidateProfileRepository profileRepository;

        @Transactional
        public CandidateProfile execute(UUID userId, UUID experienceId, WorkExperience incoming) {
                CandidateProfile profile = profileRepository.findByUserId(userId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

                WorkExperience target = profile.getExperiences().stream()
                                .filter(e -> e.getId().equals(experienceId))
                                .findFirst()
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Kinh nghiệm làm việc không tồn tại.", "EXPERIENCE_NOT_FOUND"));

                target.update(
                                incoming.getCompanyName(),
                                incoming.getPosition(),
                                incoming.getDescription(),
                                incoming.getStartDate(),
                                incoming.getEndDate(),
                                incoming.isCurrent());

                return profileRepository.save(profile);
        }
}