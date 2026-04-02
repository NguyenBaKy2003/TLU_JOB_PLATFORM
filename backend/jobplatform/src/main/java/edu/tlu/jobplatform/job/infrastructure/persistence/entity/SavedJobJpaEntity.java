package edu.tlu.jobplatform.job.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_jobs", uniqueConstraints = @UniqueConstraint(name = "uk_saved_job", columnNames = { "candidate_id",
        "job_post_id" }), indexes = {
                @Index(name = "idx_saved_candidate", columnList = "candidate_id"),
                @Index(name = "idx_saved_job", columnList = "job_post_id")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedJobJpaEntity {

    @Id
    private UUID id;

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "job_post_id", nullable = false)
    private UUID jobPostId;

    @CreationTimestamp
    @Column(name = "saved_at", nullable = false, updatable = false)
    private LocalDateTime savedAt;
}