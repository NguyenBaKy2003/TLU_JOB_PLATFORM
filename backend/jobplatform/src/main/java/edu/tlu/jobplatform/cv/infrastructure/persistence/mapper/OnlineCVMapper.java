package edu.tlu.jobplatform.cv.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.PersonalInfo;
import edu.tlu.jobplatform.cv.infrastructure.persistence.entity.CVSectionJpaEntity;
import edu.tlu.jobplatform.cv.infrastructure.persistence.entity.CVTemplateJpaEntity;
import edu.tlu.jobplatform.cv.infrastructure.persistence.entity.OnlineCVJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class OnlineCVMapper {

    // ── OnlineCV ──────────────────────────────────────────────────────────────

    /** JPA Entity → Domain Model (bao gồm sections) */
    public OnlineCV toDomain(OnlineCVJpaEntity e) {
        if (e == null)
            return null;

        List<CVSection> sections = e.getSections() == null
                ? new ArrayList<>()
                : e.getSections().stream()
                        .map(this::sectionToDomain)
                        .collect(java.util.stream.Collectors.toCollection(ArrayList::new));

        return OnlineCV.builder()
                .id(e.getId())
                .candidateId(e.getCandidateId())
                .title(e.getTitle())
                .templateId(e.getTemplateId())
                .personalInfo(toPersonalInfo(e))
                .sections(sections)
                .status(e.getStatus())
                .visibility(e.getVisibility())
                .slug(e.getSlug())
                .viewCount(e.getViewCount())
                .exportedPdfUrl(e.getExportedPdfUrl())
                .primary(e.isPrimary())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    /** Domain → New Entity (INSERT) */
    public OnlineCVJpaEntity toNewEntity(OnlineCV cv) {
        OnlineCVJpaEntity e = new OnlineCVJpaEntity();
        e.setId(cv.getId());
        mapDomainToEntity(cv, e);
        return e;
    }

    /** Domain → Existing Entity (UPDATE) — giữ nguyên createdAt/createdBy */
    public void updateEntity(OnlineCVJpaEntity e, OnlineCV cv) {
        mapDomainToEntity(cv, e);
    }

    private void mapDomainToEntity(OnlineCV cv, OnlineCVJpaEntity e) {
        e.setCandidateId(cv.getCandidateId());
        e.setTitle(cv.getTitle());
        e.setTemplateId(cv.getTemplateId());
        e.setStatus(cv.getStatus());
        e.setVisibility(cv.getVisibility());
        e.setSlug(cv.getSlug());
        e.setViewCount(cv.getViewCount());
        e.setExportedPdfUrl(cv.getExportedPdfUrl());
        e.setPrimary(cv.isPrimary());

        // PersonalInfo embedded
        PersonalInfo pi = cv.getPersonalInfo();
        if (pi != null) {
            e.setPiFullName(pi.getFullName());
            e.setPiEmail(pi.getEmail());
            e.setPiPhone(pi.getPhone());
            e.setPiAddress(pi.getAddress());
            e.setPiAvatarUrl(pi.getAvatarUrl());
            e.setPiHeadline(pi.getHeadline());
            e.setPiLinkedIn(pi.getLinkedIn());
            e.setPiGithub(pi.getGithub());
            e.setPiWebsite(pi.getWebsite());
        }

        // Sync sections — orphanRemoval sẽ xóa section cũ không còn trong list
        e.getSections().clear();
        if (cv.getSections() != null) {
            for (CVSection s : cv.getSections()) {
                CVSectionJpaEntity se = toSectionEntity(s, e);
                e.getSections().add(se);
            }
        }
    }

    // ── CVSection ─────────────────────────────────────────────────────────────

    public CVSection sectionToDomain(CVSectionJpaEntity e) {
        if (e == null)
            return null;
        return CVSection.builder()
                .id(e.getId())
                .cvId(e.getCv().getId())
                .type(e.getType())
                .title(e.getTitle())
                .content(e.getContent())
                .displayOrder(e.getDisplayOrder())
                .visible(e.isVisible())
                .build();
    }

    public CVSectionJpaEntity toSectionEntity(CVSection s, OnlineCVJpaEntity cvEntity) {
        CVSectionJpaEntity e = new CVSectionJpaEntity();
        e.setId(s.getId());
        e.setCv(cvEntity);
        e.setType(s.getType());
        e.setTitle(s.getTitle());
        e.setContent(s.getContent());
        e.setDisplayOrder(s.getDisplayOrder());
        e.setVisible(s.isVisible());
        return e;
    }

    // ── CVTemplate ────────────────────────────────────────────────────────────

    public CVTemplate templateToDomain(CVTemplateJpaEntity e) {
        if (e == null)
            return null;
        return CVTemplate.builder()
                .id(e.getId())
                .name(e.getName())
                .thumbnailUrl(e.getThumbnailUrl())
                .category(e.getCategory())
                .premium(e.isPremium())
                .htmlContent(e.getHtmlContent())
                .active(e.isActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public CVTemplateJpaEntity templateToNewEntity(CVTemplate t) {
        CVTemplateJpaEntity e = new CVTemplateJpaEntity();
        e.setId(t.getId());
        mapTemplateFields(t, e);
        return e;
    }

    public void updateTemplateEntity(CVTemplateJpaEntity e, CVTemplate t) {
        mapTemplateFields(t, e);
    }

    private void mapTemplateFields(CVTemplate t, CVTemplateJpaEntity e) {
        e.setName(t.getName());
        e.setThumbnailUrl(t.getThumbnailUrl());
        e.setCategory(t.getCategory());
        e.setPremium(t.isPremium());
        e.setHtmlContent(t.getHtmlContent());
        e.setIsActive(t.isActive());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private PersonalInfo toPersonalInfo(OnlineCVJpaEntity e) {
        if (e.getPiFullName() == null && e.getPiEmail() == null)
            return null;
        return PersonalInfo.builder()
                .fullName(e.getPiFullName())
                .email(e.getPiEmail())
                .phone(e.getPiPhone())
                .address(e.getPiAddress())
                .avatarUrl(e.getPiAvatarUrl())
                .headline(e.getPiHeadline())
                .linkedIn(e.getPiLinkedIn())
                .github(e.getPiGithub())
                .website(e.getPiWebsite())
                .build();
    }
}