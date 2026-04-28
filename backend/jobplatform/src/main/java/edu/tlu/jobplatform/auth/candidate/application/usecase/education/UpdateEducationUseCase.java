package edu.tlu.jobplatform.auth.candidate.application.usecase.education;

import edu.tlu.jobplatform.auth.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.auth.candidate.domain.model.Education;
import edu.tlu.jobplatform.auth.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateEducationUseCase {

        private final CandidateProfileRepository profileRepository;

        @Transactional
        public CandidateProfile execute(UUID userId, UUID educationId, Education incoming) {
                CandidateProfile profile = profileRepository.findByUserId(userId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

                Education target = profile.getEducations().stream()
                                .filter(e -> e.getId().equals(educationId))
                                .findFirst()
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Học vấn không tồn tại.", "EDUCATION_NOT_FOUND"));

                target.update(
                                incoming.getSchool(),
                                incoming.getMajor(),
                                incoming.getDegree(),
                                incoming.getStartDate(),
                                incoming.getEndDate(),
                                incoming.getDescription());

                return profileRepository.save(profile);
        }
}