package edu.tlu.jobplatform.company.infrastructure.persistence.entity;

import edu.tlu.jobplatform.company.domain.model.CompanyDocumentType;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "company_documents", indexes = {
        @Index(name = "idx_doc_company", columnList = "company_id"),
        @Index(name = "idx_doc_type", columnList = "company_id, type")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDocumentJpaEntity extends BaseJpaEntity {

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private CompanyDocumentType type;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size_bytes")
    private long fileSizeBytes;

}