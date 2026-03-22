package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.Skill;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GetProfileUseCase {

        private final CandidateProfileRepository profileRepository;
        private final UserRepository userRepository;

        @Transactional(readOnly = true)
        public CandidateProfile execute(UUID userId) {

                CandidateProfile profile = profileRepository.findByUserId(userId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Hồ sơ ứng viên không tồn tại.", "PROFILE_NOT_FOUND"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Người dùng không tồn tại.", "USER_NOT_FOUND"));

                return CandidateProfile.builder()
                                .id(profile.getId())
                                .userId(profile.getUserId())
                                // ── Từ users table ──────────────────────────────────────────
                                .email(user.getEmail())
                                // ── Từ candidate_profiles table ─────────────────────────────
                                .firstName(profile.getFirstName())
                                .lastName(profile.getLastName())
                                .headline(profile.getHeadline())
                                .summary(profile.getSummary())
                                .phone(profile.getPhone())
                                .location(profile.getLocation())
                                .avatarUrl(profile.getAvatarUrl())
                                .dateOfBirth(profile.getDateOfBirth())
                                .gender(profile.getGender())
                                .maritalStatus(profile.getMaritalStatus())
                                .profileUrl(profile.getProfileUrl())
                                .jobSearchStatus(profile.getJobSearchStatus())
                                .expectedSalary(profile.getExpectedSalary())
                                .currency(profile.getCurrency())
                                .skills(deduplicateSkills(profile.getSkills()))
                                .experiences(profile.getExperiences())
                                .educations(profile.getEducations())
                                .languages(profile.getLanguages())
                                .socialLinks(profile.getSocialLinks())
                                .desiredJobs(profile.getDesiredJobs())
                                .benefits(profile.getBenefits())
                                .createdAt(profile.getCreatedAt())
                                .updatedAt(profile.getUpdatedAt())
                                .build();
        }

        // ─────────────────────────────────────────────────────────────────────────

        /**
         * Giữ lại skill đầu tiên của mỗi name (case-insensitive).
         * Thứ tự gốc được bảo toàn nhờ LinkedHashMap.
         *
         * Đây là safety-net tại READ. Fix gốc rễ phải ở UpdateProfileUseCase
         * — xem comment trong file đó.
         */
        private List<Skill> deduplicateSkills(List<Skill> skills) {
                if (skills == null || skills.isEmpty())
                        return Collections.emptyList();

                Map<String, Skill> seen = new LinkedHashMap<>();
                for (Skill s : skills) {
                        seen.putIfAbsent(s.getName().toLowerCase(Locale.ROOT), s);
                }
                return new ArrayList<>(seen.values());
        }
}