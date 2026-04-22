package edu.tlu.jobplatform.cv.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.infrastructure.persistence.entity.CVTemplateJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class CVTemplateMapper {

    public CVTemplate toDomain(CVTemplateJpaEntity e) {
        return CVTemplate.builder()
                .id(e.getId())
                .name(e.getName())
                .thumbnailUrl(e.getThumbnailUrl())
                .category(e.getCategory())
                .premium(e.isPremium())
                .thymeleafTemplate(e.getThymeleafTemplate())
                .build();
    }

    public CVTemplateJpaEntity toEntity(CVTemplate domain) {
        CVTemplateJpaEntity e = new CVTemplateJpaEntity();
        e.setName(domain.getName());
        e.setThumbnailUrl(domain.getThumbnailUrl());
        e.setCategory(domain.getCategory());
        e.setPremium(domain.isPremium());
        e.setThymeleafTemplate(domain.getThymeleafTemplate());
        return e;
    }
}