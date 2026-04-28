// ── SocialLinkJpaEntity.java ──────────────────────────────────────
package edu.tlu.jobplatform.auth.candidate.infrastructure.persistence.entity;

import edu.tlu.jobplatform.auth.candidate.domain.model.SocialLink.Platform;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "social_links", indexes = {
        @Index(name = "idx_social_link_profile_id", columnList = "profile_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLinkJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private CandidateProfileJpaEntity profile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Platform platform;

    @Column(nullable = false, length = 500)
    private String url;
}