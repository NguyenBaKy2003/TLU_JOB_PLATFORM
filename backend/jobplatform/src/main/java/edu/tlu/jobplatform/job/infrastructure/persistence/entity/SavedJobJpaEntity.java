package edu.tlu.jobplatform.job.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_jobs", indexes = {
                @Index(name = "idx_saved_candidate", columnList = "candidate_id"),
                @Index(name = "idx_saved_unique", columnList = "candidate_id, job_post_id", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedJobJpaEntity extends BaseJpaEntity {

        @Column(name = "candidate_id", nullable = false)
        private UUID candidateId;

        @Column(name = "job_post_id", nullable = false)
        private UUID jobPostId;

        @Column(name = "saved_at", nullable = false)
        private LocalDateTime savedAt;
}