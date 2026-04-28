package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import edu.tlu.jobplatform.company.domain.model.CompanyDocumentType;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyDocumentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyDocumentJpaRepository extends JpaRepository<CompanyDocumentJpaEntity, UUID> {

    List<CompanyDocumentJpaEntity> findByCompanyId(UUID companyId);

    Optional<CompanyDocumentJpaEntity> findByCompanyIdAndType(UUID companyId, CompanyDocumentType type);
}