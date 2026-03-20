package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetProfileUseCase {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CandidateProfile execute(UUID userId) {
        CandidateProfile candidateProfile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Người dùng không tồn tại.", "USER_NOT_FOUND"));

        return CandidateProfile.builder()
                .id(candidateProfile.getId())
                .userId(candidateProfile.getUserId())
                // Từ users table
                .email(user.getEmail())
                // Từ candidate_profiles table
                .firstName(candidateProfile.getFirstName())
                .lastName(candidateProfile.getLastName())
                .headline(candidateProfile.getHeadline())
                .summary(candidateProfile.getSummary())
                .phone(candidateProfile.getPhone())
                .location(candidateProfile.getLocation())
                .avatarUrl(candidateProfile.getAvatarUrl())
                .dateOfBirth(candidateProfile.getDateOfBirth())
                .gender(candidateProfile.getGender())
                .maritalStatus(candidateProfile.getMaritalStatus())
                .profileUrl(candidateProfile.getProfileUrl())
                .jobSearchStatus(candidateProfile.getJobSearchStatus())
                .expectedSalary(candidateProfile.getExpectedSalary())
                .currency(candidateProfile.getCurrency())
                .skills(candidateProfile.getSkills())
                .experiences(candidateProfile.getExperiences())
                .educations(candidateProfile.getEducations())
                .languages(candidateProfile.getLanguages())
                .socialLinks(candidateProfile.getSocialLinks())
                .desiredJobs(candidateProfile.getDesiredJobs())
                .benefits(candidateProfile.getBenefits())
                .createdAt(candidateProfile.getCreatedAt())
                .updatedAt(candidateProfile.getUpdatedAt())
                .build();
    }
}