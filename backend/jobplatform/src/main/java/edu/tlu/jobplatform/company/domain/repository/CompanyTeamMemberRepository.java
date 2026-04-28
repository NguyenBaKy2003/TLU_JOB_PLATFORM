package edu.tlu.jobplatform.company.domain.repository;

import edu.tlu.jobplatform.company.domain.model.CompanyTeamMember;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyTeamMemberRepository {
    CompanyTeamMember save(CompanyTeamMember member);

    Optional<CompanyTeamMember> findById(UUID id);

    List<CompanyTeamMember> findByCompanyId(UUID companyId);

    List<CompanyTeamMember> findVisibleByCompanyId(UUID companyId);

    void deleteById(UUID id);

    int countByCompanyId(UUID companyId);
}