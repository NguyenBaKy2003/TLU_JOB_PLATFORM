package edu.tlu.jobplatform.company.infrastructure.persistence.entity;

import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_reviews", indexes = {
        @Index(name = "idx_review_company", columnList = "company_id"),
        @Index(name = "idx_review_reviewer", columnList = "reviewer_id"),
        @Index(name = "idx_review_unique", columnList = "company_id, reviewer_id", unique = true),
        @Index(name = "idx_review_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyReviewJpaEntity extends BaseJpaEntity {

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "reviewer_id", nullable = false)
    private UUID reviewerId;

    @Column(nullable = false)
    private int rating;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String pros;

    @Column(columnDefinition = "TEXT")
    private String cons;

    @Column(nullable = false)
    private boolean anonymous;

    @Column(nullable = false)
    private boolean employed;

    @Column(nullable = false)
    private boolean visible;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}