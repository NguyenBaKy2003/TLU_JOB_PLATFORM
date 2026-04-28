package edu.tlu.jobplatform.company.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.company.domain.model.CompanyDocument;
import edu.tlu.jobplatform.company.domain.model.CompanyDocumentType;
import edu.tlu.jobplatform.company.domain.repository.CompanyDocumentRepository;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyDocumentJpaEntity;
import edu.tlu.jobplatform.company.infrastructure.persistence.mapper.CompanyDocumentMapper;
import edu.tlu.jobplatform.company.infrastructure.persistence.repository.CompanyDocumentJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CompanyDocumentRepositoryAdapter implements CompanyDocumentRepository {

    private final CompanyDocumentJpaRepository jpaRepository;
    private final CompanyDocumentMapper mapper;

    @Override
    public CompanyDocument save(CompanyDocument document) {
        CompanyDocumentJpaEntity entity = jpaRepository.findById(document.getId())
                .map(existing -> {
                    mapper.updateEntity(existing, document);
                    return existing;
                })
                .orElseGet(() -> {
                    CompanyDocumentJpaEntity newEntity = mapper.toNewEntity(document);
                    newEntity.setId(document.getId());
                    return newEntity;
                });

        return mapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<CompanyDocument> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<CompanyDocument> findByCompanyIdAndType(UUID companyId,
            CompanyDocumentType type) {
        return jpaRepository.findByCompanyIdAndType(companyId, type).map(mapper::toDomain);
    }

    @Override
    public List<CompanyDocument> findByCompanyId(UUID companyId) {
        return jpaRepository.findByCompanyId(companyId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}