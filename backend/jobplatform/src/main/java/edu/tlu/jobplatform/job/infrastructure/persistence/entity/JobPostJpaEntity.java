package edu.tlu.jobplatform.job.infrastructure.persistence.entity;

import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "job_posts", indexes = {
        @Index(name = "idx_job_company", columnList = "company_id"),
        @Index(name = "idx_job_posted_by", columnList = "posted_by"),
        @Index(name = "idx_job_status", columnList = "status"),
        @Index(name = "idx_job_slug", columnList = "slug", unique = true),
        @Index(name = "idx_job_category", columnList = "category"),
        @Index(name = "idx_job_deadline", columnList = "deadline")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPostJpaEntity extends BaseJpaEntity {

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "posted_by", nullable = false)
    private UUID postedBy;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, unique = true, length = 350)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "job_type", length = 30)
    private String jobType; // FULL_TIME, PART_TIME, CONTRACT, INTERN

    @Column(length = 30)
    private String level; // INTERN, JUNIOR, MIDDLE, SENIOR, LEAD

    @Column(length = 100)
    private String category;

    // ── Salary (embedded VO)
    @Column(name = "salary_min", precision = 15, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 15, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "salary_currency", length = 10)
    private String salaryCurrency;

    @Column(name = "salary_negotiable")
    private Boolean salaryNegotiable;

    // ── WorkLocation (embedded VO)
    @Column(name = "work_location_type", length = 20)
    private String workLocationType; // ONSITE, REMOTE, HYBRID

    @Column(name = "work_location_city", length = 100)
    private String workLocationCity;

    @Column(name = "work_location_address", length = 500)
    private String workLocationAddress;

    // ── Điều kiện ─
    @Column(name = "experience_years")
    private Integer experienceYears;

    private Integer vacancies;

    // ── Thời hạn ──
    private LocalDate deadline;
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    @Column(name = "closed_at")
    private LocalDateTime closedAt;
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    // ── Trạng thái
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private int viewCount = 0;

    @Column(name = "application_count", nullable = false)
    @Builder.Default
    private int applicationCount = 0;
    @Column(name = "featured", nullable = false)
    @Builder.Default
    private boolean featured = false;

    // ── Skills ─
    @OneToMany(mappedBy = "jobPostId", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobPostSkillJpaEntity> skills = new ArrayList<>();
}