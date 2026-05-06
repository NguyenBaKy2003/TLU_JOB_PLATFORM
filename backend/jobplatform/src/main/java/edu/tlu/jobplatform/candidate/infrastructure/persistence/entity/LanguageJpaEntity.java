// ── LanguageJpaEntity.java ─
package edu.tlu.jobplatform.candidate.infrastructure.persistence.entity;

import edu.tlu.jobplatform.candidate.domain.model.Language.Level;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "languages", indexes = {
        @Index(name = "idx_language_profile_id", columnList = "profile_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LanguageJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private CandidateProfileJpaEntity profile;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Level level;
}