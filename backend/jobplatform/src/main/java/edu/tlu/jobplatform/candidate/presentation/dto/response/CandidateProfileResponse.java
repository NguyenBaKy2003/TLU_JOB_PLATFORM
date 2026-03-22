package edu.tlu.jobplatform.candidate.presentation.dto.response;

import edu.tlu.jobplatform.candidate.domain.model.*;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.JobSearchStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CandidateProfileResponse {

        private UUID id;
        private UUID userId;
        private String email;
        private String firstName;
        private String lastName;
        private String headline;
        private String summary;
        private String phone;
        private String location;
        private String avatarUrl;
        private LocalDate dateOfBirth;
        private String gender;
        private String maritalStatus;
        private String profileUrl;
        private JobSearchStatus jobSearchStatus;
        private int expectedSalary;
        private String currency;
        private List<SkillResponse> skills;
        private List<WorkExperienceResponse> experiences;
        private List<EducationResponse> educations;
        private List<LanguageResponse> languages;
        private List<SocialLinkResponse> socialLinks;
        private List<DesiredJobResponse> desiredJobs;
        private List<String> benefits;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static CandidateProfileResponse from(CandidateProfile p) {
                return CandidateProfileResponse.builder()
                                .id(p.getId())
                                .userId(p.getUserId())
                                .email(p.getEmail())
                                .firstName(p.getFirstName())
                                .lastName(p.getLastName())
                                .headline(p.getHeadline())
                                .summary(p.getSummary())
                                .phone(p.getPhone())
                                .location(p.getLocation())
                                .avatarUrl(p.getAvatarUrl())
                                .dateOfBirth(p.getDateOfBirth())
                                .gender(p.getGender())
                                .maritalStatus(p.getMaritalStatus())
                                .profileUrl(p.getProfileUrl())
                                .jobSearchStatus(p.getJobSearchStatus())
                                .expectedSalary(p.getExpectedSalary())
                                .currency(p.getCurrency())
                                .skills(p.getSkills().stream()
                                                .map(SkillResponse::from).toList())
                                .experiences(p.getExperiences().stream()
                                                .map(WorkExperienceResponse::from).toList())
                                .educations(p.getEducations().stream()
                                                .map(EducationResponse::from).toList())
                                .languages(p.getLanguages().stream()
                                                .map(LanguageResponse::from).toList())
                                .socialLinks(p.getSocialLinks().stream()
                                                .map(SocialLinkResponse::from).toList())
                                .desiredJobs(p.getDesiredJobs().stream()
                                                .map(DesiredJobResponse::from).toList())
                                .benefits(p.getBenefits().stream()
                                                .map(Benefit::getName).toList())
                                .createdAt(p.getCreatedAt())
                                .updatedAt(p.getUpdatedAt())
                                .build();
        }

        // ── Nested responses ──────────────────────────────────────────

        @Getter
        @Builder
        public static class SkillResponse {
                private String name;
                private String level;
                private int yearsOfExp;

                public static SkillResponse from(Skill s) {
                        return SkillResponse.builder()
                                        .name(s.getName())
                                        .level(s.getLevel())
                                        .yearsOfExp(s.getYearsOfExp())
                                        .build();
                }
        }

        @Getter
        @Builder
        public static class WorkExperienceResponse {
                private UUID id;
                private String companyName;
                private String position;
                private String description;
                private LocalDate startDate;
                private LocalDate endDate;
                private boolean current;

                public static WorkExperienceResponse from(WorkExperience w) {
                        return WorkExperienceResponse.builder()
                                        .id(w.getId())
                                        .companyName(w.getCompanyName())
                                        .position(w.getPosition())
                                        .description(w.getDescription())
                                        .startDate(w.getStartDate())
                                        .endDate(w.getEndDate())
                                        .current(w.isCurrent())
                                        .build();
                }
        }

        @Getter
        @Builder
        public static class EducationResponse {
                private UUID id;
                private String school;
                private String major;
                private String degree;
                private LocalDate startDate;
                private LocalDate endDate;
                private String description;

                public static EducationResponse from(Education e) {
                        return EducationResponse.builder()
                                        .id(e.getId())
                                        .school(e.getSchool())
                                        .major(e.getMajor())
                                        .degree(e.getDegree())
                                        .startDate(e.getStartDate())
                                        .endDate(e.getEndDate())
                                        .description(e.getDescription())
                                        .build();
                }
        }

        @Getter
        @Builder
        public static class LanguageResponse {
                private UUID id;
                private String name;
                private String level;

                public static LanguageResponse from(Language l) {
                        return LanguageResponse.builder()
                                        .id(l.getId())
                                        .name(l.getName())
                                        .level(l.getLevel().name())
                                        .build();
                }
        }

        @Getter
        @Builder
        public static class SocialLinkResponse {
                private UUID id;
                private String platform;
                private String url;

                public static SocialLinkResponse from(SocialLink l) {
                        return SocialLinkResponse.builder()
                                        .id(l.getId())
                                        .platform(l.getPlatform().name())
                                        .url(l.getUrl())
                                        .build();
                }
        }

        @Getter
        @Builder
        public static class DesiredJobResponse {
                private UUID id;
                private String industry;
                private int minSalary;
                private String currency;
                private List<String> contractTypes;
                private List<String> levels;

                public static DesiredJobResponse from(DesiredJob d) {
                        return DesiredJobResponse.builder()
                                        .id(d.getId())
                                        .industry(d.getIndustry())
                                        .minSalary(d.getMinSalary())
                                        .currency(d.getCurrency())
                                        .contractTypes(d.getContractTypes().stream()
                                                        .map(Enum::name).toList())
                                        .levels(d.getLevels().stream()
                                                        .map(Enum::name).toList())
                                        .build();
                }
        }
}