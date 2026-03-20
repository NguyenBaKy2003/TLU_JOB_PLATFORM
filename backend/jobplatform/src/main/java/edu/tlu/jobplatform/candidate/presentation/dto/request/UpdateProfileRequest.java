// ── UpdateProfileRequest.java ─────────────────────────────────────
package edu.tlu.jobplatform.candidate.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UpdateProfileRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 255)
    private String headline;

    @Size(max = 2000)
    private String summary;

    @Pattern(regexp = "^(\\+84|0)\\d{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 255)
    private String location;

    private LocalDate dateOfBirth;

    private String gender;

    private String maritalStatus;

    @Min(value = 0, message = "Mức lương không được âm")
    private int expectedSalary;

    private String currency;

    @Valid
    private List<SkillRequest> skills;

    @Valid
    private List<LanguageRequest> languages;

    @Valid
    private List<SocialLinkRequest> socialLinks;

    @Valid
    private DesiredJobRequest desiredJob;

    private List<String> benefits;

    // ── Nested requests ───────────────────────────────────────────

    @Data
    public static class SkillRequest {
        @NotBlank(message = "Tên kỹ năng không được để trống")
        @Size(max = 100)
        private String name;

        private String level;

        @Min(0)
        @Max(50)
        private int yearsOfExp;
    }

    @Data
    public static class LanguageRequest {
        @NotBlank(message = "Tên ngôn ngữ không được để trống")
        @Size(max = 100)
        private String name;

        @NotNull(message = "Trình độ không được để trống")
        private String level; // A1, A2, B1, B2, C1, C2, NATIVE
    }

    @Data
    public static class SocialLinkRequest {
        @NotNull(message = "Platform không được để trống")
        private String platform; // LINKEDIN, GITHUB, ...

        @NotBlank(message = "URL không được để trống")
        @Size(max = 500)
        private String url;
    }

    @Data
    public static class DesiredJobRequest {
        @Size(max = 255)
        private String industry;

        @Min(0)
        private int minSalary;

        private String currency;

        private List<String> contractTypes; // FULL_TIME, PART_TIME, ...

        private List<String> levels; // FRESHER, JUNIOR, ...
    }
}