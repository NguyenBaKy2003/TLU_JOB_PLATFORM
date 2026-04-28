package edu.tlu.jobplatform.company.domain.repository;

import edu.tlu.jobplatform.company.domain.model.CompanyGalleryImage;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyGalleryRepository {
    CompanyGalleryImage save(CompanyGalleryImage image);

    Optional<CompanyGalleryImage> findById(UUID id);

    List<CompanyGalleryImage> findByCompanyId(UUID companyId);

    void deleteById(UUID id);

    int countByCompanyId(UUID companyId);
}