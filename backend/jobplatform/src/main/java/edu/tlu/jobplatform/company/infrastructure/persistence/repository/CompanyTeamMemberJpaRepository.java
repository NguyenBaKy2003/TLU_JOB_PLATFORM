package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyTeamMemberJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CompanyTeamMemberJpaRepository extends JpaRepository<CompanyTeamMemberJpaEntity, UUID> {

    List<CompanyTeamMemberJpaEntity> findByCompanyIdOrderByDisplayOrderAsc(UUID companyId);

    List<CompanyTeamMemberJpaEntity> findByCompanyIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID companyId);

    int countByCompanyId(UUID companyId);

    @Query("""
            SELECT m FROM CompanyTeamMemberJpaEntity m
            WHERE m.companyId IN :companyIds
              AND m.isActive = true
            ORDER BY m.companyId, m.displayOrder ASC
            """)
    List<CompanyTeamMemberJpaEntity> findVisibleByCompanyIdIn(
            @Param("companyIds") Collection<UUID> companyIds);
}