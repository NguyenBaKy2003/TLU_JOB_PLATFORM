package edu.tlu.jobplatform.company.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.company.domain.model.CompanyGalleryImage;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyGalleryImageJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class CompanyGalleryImageMapper {

    public CompanyGalleryImage toDomain(CompanyGalleryImageJpaEntity e) {
        if (e == null)
            return null;
        return CompanyGalleryImage.builder()
                .id(e.getId())
                .companyId(e.getCompanyId())
                .imageUrl(e.getImageUrl())
                .caption(e.getCaption())
                .displayOrder(e.getDisplayOrder())
                .uploadedAt(e.getCreatedAt())
                .build();
    }

    public CompanyGalleryImageJpaEntity toNewEntity(CompanyGalleryImage g) {
        if (g == null)
            return null;
        CompanyGalleryImageJpaEntity entity = CompanyGalleryImageJpaEntity.builder()
                .companyId(g.getCompanyId())
                .imageUrl(g.getImageUrl())
                .caption(g.getCaption())
                .displayOrder(g.getDisplayOrder())
                .build();
        entity.setId(g.getId());
        return entity;
    }

    public void updateEntity(CompanyGalleryImageJpaEntity e, CompanyGalleryImage g) {
        if (e == null || g == null)
            return;
        e.setCaption(g.getCaption());
        e.setDisplayOrder(g.getDisplayOrder());
    }
}