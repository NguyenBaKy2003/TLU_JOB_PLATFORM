package edu.tlu.jobplatform.candidate.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Tất cả fields đều nullable = PATCH semantics.
 * null = "không gửi field này" → UseCase giữ nguyên giá trị cũ.
 *
 * Frontend chỉ gửi field nào thay đổi — không cần gửi toàn bộ.
 */
@Getter
@NoArgsConstructor
public class UpdateProfileRequest {

    // ── Basic info ────────────────────────────────────────────────────────────
    private String firstName;
    private String lastName;
    private String headline;
    private String summary;
    private String phone;
    private String location;
    private LocalDate dateOfBirth;
    private String gender;
    private String maritalStatus;

    @Min(value = 0, message = "Mức lương không được âm")
    private Integer expectedSalary; // Integer (nullable) — null = không đổi

    private String currency;

    // ── Collections — null = không đổi, [] = xóa hết ─────────────────────────
    @Valid
    private List<SkillRequest> skills;
    @Valid
    private List<LanguageRequest> languages;
    @Valid
    private List<SocialLinkRequest> socialLinks;
    @Valid
    private DesiredJobRequest desiredJob;
    private List<String> benefits;

    // ── Nested DTOs ───────────────────────────────────────────────────────────

    @Getter
    @NoArgsConstructor
    public static class SkillRequest {
        private String name;
        private String level;
        private int yearsOfExp;
    }

    @Getter
    @NoArgsConstructor
    public static class LanguageRequest {
        private String name;
        private String level;
    }

    @Getter
    @NoArgsConstructor
    public static class SocialLinkRequest {
        private String platform;
        private String url;
    }

    @Getter
    @NoArgsConstructor
    public static class DesiredJobRequest {
        private String industry;
        private Integer minSalary;
        private String currency;
        private List<String> contractTypes;
        private List<String> levels;
    }
}