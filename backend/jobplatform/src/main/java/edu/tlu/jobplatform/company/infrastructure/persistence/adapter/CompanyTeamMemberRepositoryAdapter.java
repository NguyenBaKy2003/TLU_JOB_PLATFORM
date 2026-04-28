package edu.tlu.jobplatform.company.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.company.domain.model.CompanyTeamMember;
import edu.tlu.jobplatform.company.domain.repository.CompanyTeamMemberRepository;
import edu.tlu.jobplatform.company.infrastructure.persistence.mapper.CompanyTeamMemberMapper;
import edu.tlu.jobplatform.company.infrastructure.persistence.repository.CompanyTeamMemberJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@Slf4j
@RequiredArgsConstructor
public class CompanyTeamMemberRepositoryAdapter implements CompanyTeamMemberRepository {

    private final CompanyTeamMemberJpaRepository jpaRepository;
    private final CompanyTeamMemberMapper mapper;

    @Override
    public CompanyTeamMember save(CompanyTeamMember member) {
        var entity = jpaRepository.findById(member.getId())
                .map(existing -> {
                    mapper.updateEntity(existing, member);
                    return existing;
                })
                .orElseGet(() -> mapper.toNewEntity(member));

        return mapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<CompanyTeamMember> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<CompanyTeamMember> findByCompanyId(UUID companyId) {
        return jpaRepository
                .findByCompanyIdOrderByDisplayOrderAsc(companyId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<CompanyTeamMember> findVisibleByCompanyId(UUID companyId) {
        var entities = jpaRepository
                .findByCompanyIdAndIsActiveTrueOrderByDisplayOrderAsc(companyId);
        log.info("findVisibleByCompanyId: companyId={} found={}", companyId, entities.size());
        return entities.stream().map(mapper::toDomain).toList();
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public int countByCompanyId(UUID companyId) {
        return jpaRepository.countByCompanyId(companyId);
    }
}