// ── BenefitJpaEntity.java ─────────────────────────────────────────
package edu.tlu.jobplatform.auth.candidate.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "benefits", indexes = {
        @Index(name = "idx_benefit_profile_id", columnList = "profile_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenefitJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private CandidateProfileJpaEntity profile;

    @Column(nullable = false, length = 255)
    private String name;
}