package edu.tlu.jobplatform.company.domain.repository;

import edu.tlu.jobplatform.company.domain.model.CompanyDocument;
import edu.tlu.jobplatform.company.domain.model.CompanyDocumentType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyDocumentRepository {
    CompanyDocument save(CompanyDocument document);

    Optional<CompanyDocument> findById(UUID id);

    Optional<CompanyDocument> findByCompanyIdAndType(UUID companyId, CompanyDocumentType type);

    List<CompanyDocument> findByCompanyId(UUID companyId);

    void deleteById(UUID id);
}