// ── CandidateProfileJpaEntity.java (updated) 
package edu.tlu.jobplatform.candidate.infrastructure.persistence.entity;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.JobSearchStatus;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "candidate_profiles", indexes = {
        @Index(name = "idx_candidate_user_id", columnList = "user_id", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileJpaEntity extends BaseJpaEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(length = 255)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String location;

    @Column(length = 20)
    private String postalCode;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 10)
    private String gender;

    @Column(name = "marital_status", length = 20)
    private String maritalStatus;

    @Column(name = "profile_url", length = 255, unique = true)
    private String profileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_search_status", length = 20)
    private JobSearchStatus jobSearchStatus;

    @Column(name = "expected_salary")
    private int expectedSalary;

    @Column(length = 10)
    private String currency;

    // ── Relations ──

    @ElementCollection
    @CollectionTable(name = "candidate_skills", joinColumns = @JoinColumn(name = "profile_id"))
    @Builder.Default
    private Set<SkillEmbeddable> skills = new HashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<WorkExperienceJpaEntity> experiences = new HashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<EducationJpaEntity> educations = new HashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<LanguageJpaEntity> languages = new HashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<SocialLinkJpaEntity> socialLinks = new HashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<DesiredJobJpaEntity> desiredJobs = new HashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<BenefitJpaEntity> benefits = new HashSet<>();
}