package edu.tlu.jobplatform.company.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.company.domain.model.CompanyTeamMember;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyTeamMemberJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class CompanyTeamMemberMapper {

    public CompanyTeamMember toDomain(CompanyTeamMemberJpaEntity e) {
        if (e == null)
            return null;
        return CompanyTeamMember.builder()
                .id(e.getId())
                .companyId(e.getCompanyId())
                .fullName(e.getFullName())
                .jobTitle(e.getJobTitle())
                .bio(e.getBio())
                .avatarUrl(e.getAvatarUrl())
                .linkedinUrl(e.getLinkedinUrl())
                .displayOrder(e.getDisplayOrder())
                .visible(e.isActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public CompanyTeamMemberJpaEntity toNewEntity(CompanyTeamMember m) {
        if (m == null)
            return null;
        CompanyTeamMemberJpaEntity entity = CompanyTeamMemberJpaEntity.builder()
                .companyId(m.getCompanyId())
                .fullName(m.getFullName())
                .jobTitle(m.getJobTitle())
                .bio(m.getBio())
                .avatarUrl(m.getAvatarUrl())
                .linkedinUrl(m.getLinkedinUrl())
                .displayOrder(m.getDisplayOrder())
                .build();
        entity.setId(m.getId());
        entity.setIsActive(m.isVisible());
        return entity;
    }

    public void updateEntity(CompanyTeamMemberJpaEntity e, CompanyTeamMember m) {
        if (e == null || m == null)
            return;
        e.setFullName(m.getFullName());
        e.setJobTitle(m.getJobTitle());
        e.setBio(m.getBio());
        e.setAvatarUrl(m.getAvatarUrl());
        e.setLinkedinUrl(m.getLinkedinUrl());
        e.setDisplayOrder(m.getDisplayOrder());
    }
}