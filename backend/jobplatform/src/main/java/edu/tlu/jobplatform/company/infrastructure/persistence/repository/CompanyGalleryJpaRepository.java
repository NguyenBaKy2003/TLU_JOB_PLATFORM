package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyGalleryImageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CompanyGalleryJpaRepository extends JpaRepository<CompanyGalleryImageJpaEntity, UUID> {

    List<CompanyGalleryImageJpaEntity> findByCompanyIdOrderByDisplayOrderAsc(UUID companyId);

    int countByCompanyId(UUID companyId);

    @Query("""
            SELECT g FROM CompanyGalleryImageJpaEntity g
            WHERE g.companyId IN :companyIds
            ORDER BY g.companyId, g.displayOrder ASC
            """)
    List<CompanyGalleryImageJpaEntity> findByCompanyIdIn(
            @Param("companyIds") Collection<UUID> companyIds);
}