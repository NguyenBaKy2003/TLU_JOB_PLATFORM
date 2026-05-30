package edu.tlu.jobplatform.cv.application.port.out;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Port cross-domain — lấy dữ liệu từ CandidateProfile để import vào CV.
 */
public interface CandidateProfileQueryPort {

        ProfileSnapshot getProfileSnapshot(UUID candidateId);

        record ProfileSnapshot(
                        String fullName,
                        String email,
                        String phone,
                        String headline,
                        String summary,
                        String location,
                        String avatarUrl,
                        List<ExperienceItem> experiences,
                        List<EducationItem> educations,
                        List<SkillItem> skills,
                        List<LanguageItem> languages,
                        List<SocialLinkItem> socialLinks) {
        }

        record ExperienceItem(
                        String companyName,
                        String position,
                        String description,
                        LocalDate startDate,
                        LocalDate endDate,
                        boolean current) {
        }

        record EducationItem(
                        String school,
                        String degree,
                        String major,
                        LocalDate startDate,
                        LocalDate endDate) {
        }

        /**
         * Skill từ CandidateProfile.
         * Import CV chỉ dùng name; level/yearsOfExp là metadata riêng của profile.
         */
        record SkillItem(
                        String name,
                        String level, // nullable — BEGINNER / INTERMEDIATE / ADVANCED
                        int yearsOfExp) {
        }

        record LanguageItem(String name, String level) {
        }

        record SocialLinkItem(String platform, String url) {
        }
}