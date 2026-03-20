// ── CandidateProfile.java ─────────────────────────────────────────
package edu.tlu.jobplatform.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Builder
public class CandidateProfile {

    public enum JobSearchStatus {
        ACTIVELY_LOOKING,
        OPEN_TO_OFFERS,
        NOT_LOOKING
    }

    private final UUID id;
    private final UUID userId;

    // Merged từ users table (readonly)
    private String email;

    // Fields trong candidate_profiles
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

    // ── Basic info ────────────────────────────────────────────────

    public void updateBasicInfo(String firstName, String lastName, String headline,
            String summary, String phone, String location,
            LocalDate dateOfBirth, String gender, String maritalStatus,
            int expectedSalary, String currency) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.headline = headline;
        this.summary = summary;
        this.phone = phone;
        this.location = location;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.maritalStatus = maritalStatus;
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

    // ── Skills ───────────────────────────────────────────────────

    public void replaceSkills(List<Skill> newSkills) {
        this.skills = new ArrayList<>(newSkills);
        this.updatedAt = LocalDateTime.now();
    }

    // ── Experiences ──────────────────────────────────────────────

    public void addExperience(WorkExperience exp) {
        experiences.add(exp);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeExperience(UUID id) {
        experiences.removeIf(e -> e.getId().equals(id));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Educations ───────────────────────────────────────────────

    public void addEducation(Education edu) {
        educations.add(edu);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeEducation(UUID id) {
        educations.removeIf(e -> e.getId().equals(id));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Languages ────────────────────────────────────────────────

    public void addLanguage(Language lang) {
        boolean exists = languages.stream()
                .anyMatch(l -> l.getName().equalsIgnoreCase(lang.getName()));
        if (!exists) {
            languages.add(lang);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void removeLanguage(UUID id) {
        languages.removeIf(l -> l.getId().equals(id));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Social Links ─────────────────────────────────────────────

    public void addSocialLink(SocialLink link) {
        socialLinks.removeIf(l -> l.getPlatform() == link.getPlatform());
        socialLinks.add(link);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeSocialLink(UUID id) {
        socialLinks.removeIf(l -> l.getId().equals(id));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Desired Jobs ─────────────────────────────────────────────

    public void updateDesiredJob(DesiredJob desiredJob) {
        this.desiredJobs = new ArrayList<>(List.of(desiredJob));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Benefits ─────────────────────────────────────────────────

    public void replaceBenefits(List<Benefit> newBenefits) {
        this.benefits = new ArrayList<>(newBenefits);
        this.updatedAt = LocalDateTime.now();
    }

    // ── Read-only views ──────────────────────────────────────────

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