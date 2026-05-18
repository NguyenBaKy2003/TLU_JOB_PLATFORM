package edu.tlu.jobplatform.ai.infrastructure.persistence.entity;

import edu.tlu.jobplatform.ai.domain.model.SearchEvent;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "search_events", indexes = {
        @Index(name = "idx_search_events_candidate_occurred", columnList = "candidate_id, occurred_at DESC"),
        @Index(name = "idx_search_events_keyword", columnList = "keyword")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchEventJpaEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30)
    private SearchEvent.EventType eventType;

    @Column(name = "keyword", length = 200)
    private String keyword;

    @Column(name = "job_post_id")
    private UUID jobPostId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "dwell_seconds")
    private int dwellSeconds;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;
}