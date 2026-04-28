package edu.tlu.jobplatform.company.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.company.domain.model.CompanyDocument;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyDocumentJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class CompanyDocumentMapper {

    public CompanyDocument toDomain(CompanyDocumentJpaEntity e) {
        if (e == null)
            return null;
        return CompanyDocument.builder()
                .id(e.getId())
                .companyId(e.getCompanyId())
                .type(e.getType())
                .fileName(e.getFileName())
                .fileUrl(e.getFileUrl())
                .mimeType(e.getMimeType())
                .fileSizeBytes(e.getFileSizeBytes())
                .uploadedAt(e.getCreatedAt())
                .build();
    }

    public CompanyDocumentJpaEntity toNewEntity(CompanyDocument d) {
        if (d == null)
            return null;
        CompanyDocumentJpaEntity entity = CompanyDocumentJpaEntity.builder()
                .companyId(d.getCompanyId())
                .type(d.getType())
                .fileName(d.getFileName())
                .fileUrl(d.getFileUrl())
                .mimeType(d.getMimeType())
                .fileSizeBytes(d.getFileSizeBytes())
                .build();
        entity.setId(d.getId());
        return entity;
    }

    public void updateEntity(CompanyDocumentJpaEntity e, CompanyDocument d) {
        if (e == null || d == null)
            return;
        e.setFileName(d.getFileName());
        e.setFileUrl(d.getFileUrl());
        e.setMimeType(d.getMimeType());
        e.setFileSizeBytes(d.getFileSizeBytes());

    }
}