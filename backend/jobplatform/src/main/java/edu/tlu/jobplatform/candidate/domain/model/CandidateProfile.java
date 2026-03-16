package edu.tlu.jobplatform.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Aggregate Root của Candidate domain.
 * Quản lý toàn bộ thông tin hồ sơ ứng viên.
 */
@Getter
@Builder
public class CandidateProfile {

    public enum JobSearchStatus {
        ACTIVELY_LOOKING, // đang tìm việc gấp
        OPEN_TO_OFFERS, // sẵn sàng nếu có cơ hội tốt
        NOT_LOOKING // không tìm việc
    }

    private final UUID id;
    private final UUID userId; // FK → User domain
    private String headline; // "Senior Java Developer | 5 years exp"
    private String summary; // giới thiệu bản thân
    private String phone;
    private String location; // "Hà Nội, Việt Nam"
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String gender; // "MALE" | "FEMALE" | "OTHER"
    private JobSearchStatus jobSearchStatus;
    private int expectedSalary; // đơn vị: triệu VNĐ
    private String currency; // "VND" | "USD"

    @Builder.Default
    private List<WorkExperience> experiences = new ArrayList<>();

    @Builder.Default
    private List<Education> educations = new ArrayList<>();

    @Builder.Default
    private List<Skill> skills = new ArrayList<>();

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Profile update ────────────────────────────────────────────

    public void updateBasicInfo(String headline, String summary, String phone,
            String location, LocalDate dateOfBirth,
            String gender, int expectedSalary, String currency) {
        this.headline = headline;
        this.summary = summary;
        this.phone = phone;
        this.location = location;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.expectedSalary = Math.max(expectedSalary, 0);
        this.currency = currency;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateAvatar(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateJobSearchStatus(JobSearchStatus status) {
        this.jobSearchStatus = status;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Skills ────────────────────────────────────────────────────

    public void addSkill(Skill skill) {
        boolean exists = skills.stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(skill.getName()));
        if (!exists)
            skills.add(skill);
    }

    public void removeSkill(String skillName) {
        skills.removeIf(s -> s.getName().equalsIgnoreCase(skillName));
    }

    public void replaceSkills(List<Skill> newSkills) {
        this.skills = new ArrayList<>(newSkills);
        this.updatedAt = LocalDateTime.now();
    }

    // ── Work Experience ───────────────────────────────────────────

    public void addExperience(WorkExperience exp) {
        experiences.add(exp);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeExperience(UUID expId) {
        experiences.removeIf(e -> e.getId().equals(expId));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Education ─────────────────────────────────────────────────

    public void addEducation(Education edu) {
        educations.add(edu);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeEducation(UUID eduId) {
        educations.removeIf(e -> e.getId().equals(eduId));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Read-only views ───────────────────────────────────────────

    public List<WorkExperience> getExperiences() {
        return Collections.unmodifiableList(experiences);
    }

    public List<Education> getEducations() {
        return Collections.unmodifiableList(educations);
    }

    public List<Skill> getSkills() {
        return Collections.unmodifiableList(skills);
    }
}