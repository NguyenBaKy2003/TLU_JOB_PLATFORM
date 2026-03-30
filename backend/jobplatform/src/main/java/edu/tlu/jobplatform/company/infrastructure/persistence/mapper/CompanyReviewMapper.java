package edu.tlu.jobplatform.company.infrastructure.persistence.mapper;

import org.springframework.stereotype.Component;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyReviewJpaEntity;

@Component
public class CompanyReviewMapper {

    // ── Entity → Domain ─────────────────────────────────────

    public CompanyReview toDomain(CompanyReviewJpaEntity e) {
        if (e == null)
            return null;

        return CompanyReview.builder()
                .id(e.getId())
                .companyId(e.getCompanyId())
                .reviewerId(e.getReviewerId())
                .rating(e.getRating())
                .title(e.getTitle())
                .content(e.getContent())
                .pros(e.getPros())
                .cons(e.getCons())
                .anonymous(e.isAnonymous())
                .employed(e.isEmployed())
                .visible(e.isVisible())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    // ── Domain → Entity (create new) ─────────────────────────

    public CompanyReviewJpaEntity toNewEntity(CompanyReview r) {
        if (r == null)
            return null;

        return CompanyReviewJpaEntity.builder()
                .companyId(r.getCompanyId())
                .reviewerId(r.getReviewerId())
                .rating(r.getRating())
                .title(r.getTitle())
                .content(r.getContent())
                .pros(r.getPros())
                .cons(r.getCons())
                .anonymous(r.isAnonymous())
                .employed(r.isEmployed())
                .visible(r.isVisible())
                .build();
    }

    // ── Update Entity ───────────────────────────────────────

    public void updateEntity(CompanyReviewJpaEntity e, CompanyReview r) {
        if (e == null || r == null)
            return;

        e.setRating(r.getRating());
        e.setTitle(r.getTitle());
        e.setContent(r.getContent());
        e.setPros(r.getPros());
        e.setCons(r.getCons());
        e.setAnonymous(r.isAnonymous());
        e.setEmployed(r.isEmployed());
        e.setVisible(r.isVisible());

        // ❗ Không update:
        // - companyId
        // - reviewerId
        // - id
        // - createdAt
    }
}