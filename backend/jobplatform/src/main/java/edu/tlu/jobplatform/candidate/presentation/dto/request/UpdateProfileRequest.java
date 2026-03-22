package edu.tlu.jobplatform.candidate.presentation.dto.request;

import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Getter
@NoArgsConstructor
public class UpdateProfileRequest {

    // ── Basic info — Optional<T> để hỗ trợ xóa giá trị ──────────────────────

    private Optional<String> firstName = null;
    private Optional<String> lastName = null;
    private Optional<String> headline = null;
    private Optional<String> summary = null;
    private Optional<String> phone = null;
    private Optional<String> location = null;
    private Optional<LocalDate> dateOfBirth = null;
    private Optional<String> gender = null;
    private Optional<String> maritalStatus = null;

    private Optional<Integer> expectedSalary = null; // validation trong setter bên dưới

    private Optional<String> currency = null;

    @JsonSetter("firstName")
    public void setFirstName(String v) {
        this.firstName = Optional.ofNullable(v);
    }

    @JsonSetter("lastName")
    public void setLastName(String v) {
        this.lastName = Optional.ofNullable(v);
    }

    @JsonSetter("headline")
    public void setHeadline(String v) {
        this.headline = Optional.ofNullable(v);
    }

    @JsonSetter("summary")
    public void setSummary(String v) {
        this.summary = Optional.ofNullable(v);
    }

    @JsonSetter("phone")
    public void setPhone(String v) {
        this.phone = Optional.ofNullable(v);
    }

    @JsonSetter("location")
    public void setLocation(String v) {
        this.location = Optional.ofNullable(v);
    }

    @JsonSetter("dateOfBirth")
    public void setDateOfBirth(LocalDate v) {
        this.dateOfBirth = Optional.ofNullable(v);
    }

    @JsonSetter("gender")
    public void setGender(String v) {
        this.gender = Optional.ofNullable(v);
    }

    @JsonSetter("maritalStatus")
    public void setMaritalStatus(String v) {
        this.maritalStatus = Optional.ofNullable(v);
    }

    @JsonSetter("expectedSalary")
    public void setExpectedSalary(Integer v) {
        if (v != null && v < 0) {
            throw new jakarta.validation.ValidationException("Mức lương không được âm");
        }
        this.expectedSalary = Optional.ofNullable(v);
    }

    @JsonSetter("currency")
    public void setCurrency(String v) {
        this.currency = Optional.ofNullable(v);
    }

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