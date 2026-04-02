package edu.tlu.jobplatform.job.infrastructure.persistence.entity;

import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "job_posts", indexes = {
        @Index(name = "idx_job_company", columnList = "company_id"),
        @Index(name = "idx_job_status", columnList = "status"),
        @Index(name = "idx_job_category", columnList = "category_code"),
        @Index(name = "idx_job_deadline", columnList = "deadline"),
        @Index(name = "idx_job_featured", columnList = "featured, status")
})
@Setter
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class JobPostJpaEntity extends BaseJpaEntity {

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    // ── Nội dung ──────────────────────────────────────────────
    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "category_code", length = 50)
    private String categoryCode;

    @Column(length = 30)
    private String level; // INTERN, JUNIOR, SENIOR, MANAGER, DIRECTOR

    @Column(name = "job_type", length = 30)
    private String jobType; // FULL_TIME, PART_TIME, CONTRACT, FREELANCE

    @Column(nullable = false)
    private int headcount;

    // ── Salary (flattened) ────────────────────────────────────
    @Column(name = "salary_min", precision = 15, scale = 0)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 15, scale = 0)
    private BigDecimal salaryMax;

    @Column(name = "salary_currency", length = 10)
    private String salaryCurrency;

    @Column(name = "salary_negotiate", nullable = false)
    private boolean salaryNegotiate;

    // ── Work Location (flattened) ─────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "work_location_type", length = 20)
    private WorkLocation.Type workLocationType;

    @Column(name = "work_location_city", length = 100)
    private String workLocationCity;

    @Column(name = "work_location_district", length = 100)
    private String workLocationDistrict;

    @Column(name = "work_location_address", length = 255)
    private String workLocationAddress;

    // ── Trạng thái ────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "view_count", nullable = false)
    private int viewCount;

    // ── Thời hạn ─────────────────────────────────────────────
    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    // ── Skills (one-to-many) ──────────────────────────────────
    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobPostSkillJpaEntity> skills = new ArrayList<>();
}