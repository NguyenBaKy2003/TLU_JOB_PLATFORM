package edu.tlu.jobplatform.candidate.infrastructure.persistence.entity;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV.CVType;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "candidate_cvs", indexes = {
        @Index(name = "idx_cv_candidate_id", columnList = "candidate_id"),
        @Index(name = "idx_cv_primary", columnList = "candidate_id, is_primary")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateCVJpaEntity extends BaseJpaEntity {

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CVType type;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "parsed_content", columnDefinition = "TEXT")
    private String parsedContent;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;
}