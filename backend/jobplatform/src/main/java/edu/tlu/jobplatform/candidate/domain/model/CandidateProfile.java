package edu.tlu.jobplatform.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Getter
@Builder
public class CandidateProfile {

    public enum JobSearchStatus {
        ACTIVELY_LOOKING, OPEN_TO_OFFERS, NOT_LOOKING
    }

    private final UUID id;
    private final UUID userId;

    // Từ bảng users — inject sau khi load, không persist
    private String email;

    public void setEmail(String email) {
        this.email = email;
    }

    // ── Scalar fields ─────────────────────────────────────────────────────────
    private String firstName;
    private String lastName;
    private String headline;
    private String summary;
    private String phone;
    private String location;
    private String postalCode;
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String gender;
    private String maritalStatus;
    private String profileUrl;
    private JobSearchStatus jobSearchStatus;
    private int expectedSalary;
    private String currency;

    @Builder.Default
    private List<Skill> skills = new ArrayList<>();
    @Builder.Default
    private List<WorkExperience> experiences = new ArrayList<>();
    @Builder.Default
    private List<Education> educations = new ArrayList<>();
    @Builder.Default
    private List<Language> languages = new ArrayList<>();
    @Builder.Default
    private List<SocialLink> socialLinks = new ArrayList<>();
    @Builder.Default
    private List<DesiredJob> desiredJobs = new ArrayList<>();
    @Builder.Default
    private List<Benefit> benefits = new ArrayList<>();

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── updateBasicInfo — FULL replace (dùng khi gửi toàn bộ form) ───────────

    public void updateBasicInfo(
            String firstName, String lastName,
            String headline, String summary,
            String phone, String location, String postalCode,
            LocalDate dateOfBirth, String gender, String maritalStatus,
            int expectedSalary, String currency) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.headline = headline;
        this.summary = summary;
        this.phone = phone;
        this.location = location;
        this.postalCode = postalCode;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.maritalStatus = maritalStatus;
        this.expectedSalary = Math.max(expectedSalary, 0);
        this.currency = currency;
        this.updatedAt = LocalDateTime.now();
    }

    // ── patchBasicInfo — PARTIAL update với Optional<T> ──────────────────────
    //
    // Ba trạng thái của mỗi Optional parameter:
    // null = frontend không gửi field → giữ nguyên giá trị cũ
    // Optional.empty() = frontend gửi null → xóa (set null / 0)
    // Optional.of(v) = frontend gửi giá trị v → cập nhật thành v

    public void patchBasicInfo(
            Optional<String> firstName,
            Optional<String> lastName,
            Optional<String> headline,
            Optional<String> summary,
            Optional<String> phone,
            Optional<String> location,
            Optional<String> postalCode,
            Optional<LocalDate> dateOfBirth,
            Optional<String> gender,
            Optional<String> maritalStatus,
            Optional<Integer> expectedSalary,
            Optional<String> currency) {

        if (firstName != null)
            this.firstName = firstName.orElse(null);
        if (lastName != null)
            this.lastName = lastName.orElse(null);
        if (headline != null)
            this.headline = headline.orElse(null);
        if (summary != null)
            this.summary = summary.orElse(null);
        if (phone != null)
            this.phone = phone.orElse(null);
        if (location != null)
            this.location = location.orElse(null);
        if (postalCode != null)
            this.postalCode = postalCode.orElse(null);
        if (dateOfBirth != null)
            this.dateOfBirth = dateOfBirth.orElse(null);
        if (gender != null)
            this.gender = gender.orElse(null);
        if (maritalStatus != null)
            this.maritalStatus = maritalStatus.orElse(null);
        if (expectedSalary != null)
            this.expectedSalary = Math.max(expectedSalary.orElse(0), 0);
        if (currency != null)
            this.currency = currency.orElse(null);

        this.updatedAt = LocalDateTime.now();
    }

    // ── Avatar & status ───────────────────────────────────────────────────────

    public void updateAvatar(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateJobSearchStatus(JobSearchStatus status) {
        this.jobSearchStatus = status;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Skills ────────────────────────────────────────────────────────────────

    public void replaceSkills(List<Skill> incoming) {
        this.skills = new ArrayList<>(incoming);
        this.updatedAt = LocalDateTime.now();
    }

    // ── Languages ─────────────────────────────────────────────────────────────

    public void replaceLanguages(List<Language> incoming) {
        this.languages = incoming.stream()
                .filter(l -> l.getName() != null && !l.getName().isBlank())
                .collect(Collectors.toCollection(ArrayList::new));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Social Links ──────────────────────────────────────────────────────────

    public void replaceSocialLinks(List<SocialLink> incoming) {
        this.socialLinks = incoming.stream()
                .filter(l -> l.getUrl() != null && !l.getUrl().isBlank())
                .collect(Collectors.toCollection(ArrayList::new));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Experiences ───────────────────────────────────────────────────────────

    public void addExperience(WorkExperience exp) {
        experiences.add(exp);
        this.updatedAt = LocalDateTime.now();
    }

    public void updateExperience(UUID id, WorkExperience updated) {
        for (int i = 0; i < experiences.size(); i++) {
            if (experiences.get(i).getId().equals(id)) {
                experiences.set(i, updated);
                this.updatedAt = LocalDateTime.now();
                return;
            }
        }
        throw new IllegalArgumentException("Không tìm thấy kinh nghiệm: " + id);
    }

    public void removeExperience(UUID id) {
        experiences.removeIf(e -> e.getId().equals(id));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Educations ────────────────────────────────────────────────────────────

    public void addEducation(Education edu) {
        educations.add(edu);
        this.updatedAt = LocalDateTime.now();
    }

    public void updateEducation(UUID id, Education updated) {
        for (int i = 0; i < educations.size(); i++) {
            if (educations.get(i).getId().equals(id)) {
                educations.set(i, updated);
                this.updatedAt = LocalDateTime.now();
                return;
            }
        }
        throw new IllegalArgumentException("Không tìm thấy học vấn: " + id);
    }

    public void removeEducation(UUID id) {
        educations.removeIf(e -> e.getId().equals(id));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Desired Jobs ──────────────────────────────────────────────────────────

    public void updateDesiredJob(DesiredJob desiredJob) {
        this.desiredJobs = new ArrayList<>(List.of(desiredJob));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Profile URL ───────────────────────────────────────────────────────────

    public void updateProfileUrl(String profileUrl) {
        this.profileUrl = profileUrl;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Benefits ──────────────────────────────────────────────────────────────

    public void replaceBenefits(List<Benefit> incoming) {
        this.benefits = new ArrayList<>(incoming);
        this.updatedAt = LocalDateTime.now();
    }

    // ── Read-only views ───────────────────────────────────────────────────────

    public List<Skill> getSkills() {
        return Collections.unmodifiableList(skills);
    }

    public List<WorkExperience> getExperiences() {
        return Collections.unmodifiableList(experiences);
    }

    public List<Education> getEducations() {
        return Collections.unmodifiableList(educations);
    }

    public List<Language> getLanguages() {
        return Collections.unmodifiableList(languages);
    }

    public List<SocialLink> getSocialLinks() {
        return Collections.unmodifiableList(socialLinks);
    }

    public List<DesiredJob> getDesiredJobs() {
        return Collections.unmodifiableList(desiredJobs);
    }

    public List<Benefit> getBenefits() {
        return Collections.unmodifiableList(benefits);
    }
}