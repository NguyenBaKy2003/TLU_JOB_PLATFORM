package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyTeamMemberJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CompanyTeamMemberJpaRepository extends JpaRepository<CompanyTeamMemberJpaEntity, UUID> {

    List<CompanyTeamMemberJpaEntity> findByCompanyIdOrderByDisplayOrderAsc(UUID companyId);

    List<CompanyTeamMemberJpaEntity> findByCompanyIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID companyId);

    int countByCompanyId(UUID companyId);
}