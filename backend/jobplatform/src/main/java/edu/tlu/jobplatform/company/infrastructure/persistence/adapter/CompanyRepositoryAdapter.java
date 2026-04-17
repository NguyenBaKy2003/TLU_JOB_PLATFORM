package edu.tlu.jobplatform.company.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyJpaEntity;
import edu.tlu.jobplatform.company.infrastructure.persistence.mapper.CompanyMapper;
import edu.tlu.jobplatform.company.infrastructure.persistence.repository.CompanyJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CompanyRepositoryAdapter implements CompanyRepository {

    private final CompanyJpaRepository jpaRepo;
    private final CompanyMapper mapper;

    @Override
    public Optional<CompanyProfile> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<CompanyProfile> findByOwnerId(UUID ownerId) {
        return jpaRepo.findByOwnerId(ownerId).map(mapper::toDomain);
    }

    @Override
    public Optional<CompanyProfile> findBySlug(String slug) {
        return jpaRepo.findBySlug(slug).map(mapper::toDomain);
    }

    @Override
    public boolean existsByOwnerId(UUID ownerId) {
        return jpaRepo.existsByOwnerId(ownerId);
    }

    @Override
    public List<CompanyProfile> findAllById(Collection<UUID> ids) {
        return jpaRepo.findAllById(ids).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsBySlug(String slug) {
        return jpaRepo.existsBySlug(slug);
    }

    @Override
    public boolean existsByName(String name) {
        return jpaRepo.existsByName(name);
    }

    @Override
    public long countAll() {
        return jpaRepo.count();
    }

    @Override
    public long countByVerificationStatus(VerificationStatus status) {
        return jpaRepo.countByVerificationStatus(status);
    }

    @Override
    public Page<CompanyProfile> findByVerificationStatus(VerificationStatus status, Pageable pageable) {
        return jpaRepo.findByVerificationStatus(status, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<CompanyProfile> findVerifiedCompanies(Pageable pageable) {
        return jpaRepo.findByVerificationStatusAndIsActiveTrue(
                VerificationStatus.VERIFIED, pageable).map(mapper::toDomain);
    }

    @Override
    public CompanyProfile save(CompanyProfile company) {
        if (company.getId() != null) {
            Optional<CompanyJpaEntity> existing = jpaRepo.findById(company.getId());
            if (existing.isPresent()) {
                CompanyJpaEntity entity = existing.get();
                mapper.updateEntity(entity, company);
                return mapper.toDomain(jpaRepo.save(entity));
            }
        }
        return mapper.toDomain(jpaRepo.save(mapper.toNewEntity(company)));
    }

    @Override
    public List<CompanyProfile> findAllByOwnerIdIn(Collection<UUID> ownerIds) {
        return jpaRepo.findAllByOwnerIdIn(ownerIds)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}