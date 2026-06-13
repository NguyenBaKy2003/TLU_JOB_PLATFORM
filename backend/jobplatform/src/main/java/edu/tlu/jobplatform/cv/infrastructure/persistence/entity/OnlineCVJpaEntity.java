package edu.tlu.jobplatform.cv.infrastructure.persistence.entity;

import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "online_cvs", indexes = {
        @Index(name = "idx_online_cvs_candidate_id", columnList = "candidate_id"),
        @Index(name = "idx_online_cvs_slug", columnList = "slug", unique = true),
        @Index(name = "idx_online_cvs_status", columnList = "status"),
        @Index(name = "idx_online_cvs_primary", columnList = "candidate_id, is_primary")
})
@Getter
@Setter
@NoArgsConstructor
public class OnlineCVJpaEntity extends BaseJpaEntity {

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "template_id", nullable = false)
    private UUID templateId;

    // ── PersonalInfo (embedded) ───────────────────────────────────────────────

    @Column(name = "pi_full_name", length = 150)
    private String piFullName;

    @Column(name = "pi_email", length = 255)
    private String piEmail;

    @Column(name = "pi_phone", length = 30)
    private String piPhone;

    @Column(name = "pi_address", length = 300)
    private String piAddress;

    @Column(name = "pi_avatar_url", length = 500)
    private String piAvatarUrl;

    @Column(name = "pi_headline", length = 300)
    private String piHeadline;

    @Column(name = "pi_linkedin", length = 300)
    private String piLinkedIn;

    @Column(name = "pi_github", length = 300)
    private String piGithub;

    @Column(name = "pi_website", length = 300)
    private String piWebsite;

    // ── Status & visibility ───────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CVStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    private CVVisibility visibility;

    @Column(name = "slug", unique = true, length = 300)
    private String slug;

    @Column(name = "view_count", nullable = false)
    private long viewCount = 0L;

    @Column(name = "exported_pdf_url", length = 500)
    private String exportedPdfUrl;

    /**
     * CV chính dùng để apply — đồng bộ với candidate_cvs.is_primary.
     * Chỉ 1 CV (uploaded hoặc online) của mỗi candidate được là primary.
     *
     * Migration:
     * ALTER TABLE online_cvs
     * ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;
     */
    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;

    // ── Sections ──────────────────────────────────────────────────────────────

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("display_order ASC")
    private List<CVSectionJpaEntity> sections = new ArrayList<>();
}