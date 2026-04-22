package edu.tlu.jobplatform.cv.application.port.out;

import java.util.UUID;

/**
 * Port cross-domain — lấy dữ liệu từ CandidateProfile để import vào CV.
 *
 * Tại sao cần port riêng?
 * Domain CV không được phép inject trực tiếp CandidateProfileRepository
 * (vi phạm nguyên tắc domain isolation). Port này là "cửa ra" để infra
 * layer làm cầu nối giữa hai domain.
 *
 * Implementation: CandidateProfileQueryAdapter (infra layer).
 */
public interface CandidateProfileQueryPort {

    /**
     * Lấy dữ liệu profile đã được chuyển đổi thành DTO trung gian
     * dùng cho việc import vào CV sections.
     */
    ProfileSnapshot getProfileSnapshot(UUID candidateId);

    /**
     * DTO trung gian — chỉ chứa dữ liệu cần thiết cho import CV.
     * Không dùng domain model của candidate để tránh tight coupling.
     */
    record ProfileSnapshot(
            String fullName,
            String email,
            String phone,
            String headline,
            String summary,
            String location,
            String avatarUrl,
            java.util.List<ExperienceItem> experiences,
            java.util.List<EducationItem> educations,
            java.util.List<String> skills,
            java.util.List<LanguageItem> languages) {
    }

    record ExperienceItem(
            String companyName,
            String position,
            String description,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            boolean current) {
    }

    record EducationItem(
            String school,
            String degree,
            String major,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate) {
    }

    record LanguageItem(String name, String level) {
    }
}