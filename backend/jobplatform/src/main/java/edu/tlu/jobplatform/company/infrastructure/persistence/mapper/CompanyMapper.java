package edu.tlu.jobplatform.company.infrastructure.persistence.mapper;

import org.springframework.stereotype.Component;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyJpaEntity;

@Component
public class CompanyMapper {

    // ── Entity → Domain ─

    public CompanyProfile toDomain(CompanyJpaEntity e) {
        if (e == null)
            return null;

        return CompanyProfile.builder()
                .id(e.getId())
                .ownerId(e.getOwnerId())
                .name(e.getName())
                .slug(e.getSlug())
                .description(e.getDescription())
                .website(e.getWebsite())
                .email(e.getEmail())
                .phone(e.getPhone())
                .address(e.getAddress())
                .city(e.getCity())
                .country(e.getCountry())
                .industry(e.getIndustry())
                .size(e.getSize())
                .foundedYear(e.getFoundedYear())
                .logoUrl(e.getLogoUrl())
                .active(e.isActive())
                .coverImageUrl(e.getCoverImageUrl())
                .verificationStatus(e.getVerificationStatus())
                .rejectionReason(e.getRejectionReason())
                .verifiedAt(e.getVerifiedAt())
                .verifiedBy(e.getVerifiedBy())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    // ── Domain → Entity (create new) ─

    public CompanyJpaEntity toNewEntity(CompanyProfile c) {
        if (c == null)
            return null;

        return CompanyJpaEntity.builder()
                .ownerId(c.getOwnerId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .website(c.getWebsite())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .city(c.getCity())
                .country(c.getCountry())
                .industry(c.getIndustry())
                .size(c.getSize())
                .foundedYear(c.getFoundedYear())
                .logoUrl(c.getLogoUrl())
                .coverImageUrl(c.getCoverImageUrl())
                .verificationStatus(c.getVerificationStatus())
                .rejectionReason(c.getRejectionReason())
                .verifiedAt(c.getVerifiedAt())
                .verifiedBy(c.getVerifiedBy())
                .build();
    }

    // ── Update Entity (merge) ─

    public void updateEntity(CompanyJpaEntity e, CompanyProfile c) {
        if (e == null || c == null)
            return;

        e.setName(c.getName());
        e.setSlug(c.getSlug());
        e.setDescription(c.getDescription());
        e.setWebsite(c.getWebsite());
        e.setEmail(c.getEmail());
        e.setPhone(c.getPhone());
        e.setAddress(c.getAddress());
        e.setCity(c.getCity());
        e.setCountry(c.getCountry());
        e.setIndustry(c.getIndustry());
        e.setSize(c.getSize());
        e.setFoundedYear(c.getFoundedYear());
        e.setLogoUrl(c.getLogoUrl());
        e.setCoverImageUrl(c.getCoverImageUrl());
        e.setVerificationStatus(c.getVerificationStatus());
        e.setRejectionReason(c.getRejectionReason());
        e.setVerifiedAt(c.getVerifiedAt());
        e.setVerifiedBy(c.getVerifiedBy());

    }
}