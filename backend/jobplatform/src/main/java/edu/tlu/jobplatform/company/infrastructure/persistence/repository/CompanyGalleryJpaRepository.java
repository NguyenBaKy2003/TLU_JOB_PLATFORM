package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyGalleryImageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CompanyGalleryJpaRepository extends JpaRepository<CompanyGalleryImageJpaEntity, UUID> {

    List<CompanyGalleryImageJpaEntity> findByCompanyIdOrderByDisplayOrderAsc(UUID companyId);

    int countByCompanyId(UUID companyId);
}