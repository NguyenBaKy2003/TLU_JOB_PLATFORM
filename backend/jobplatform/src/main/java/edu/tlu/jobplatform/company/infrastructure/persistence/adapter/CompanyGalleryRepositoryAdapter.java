package edu.tlu.jobplatform.company.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.company.domain.model.CompanyGalleryImage;
import edu.tlu.jobplatform.company.domain.repository.CompanyGalleryRepository;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyGalleryImageJpaEntity;
import edu.tlu.jobplatform.company.infrastructure.persistence.mapper.CompanyGalleryImageMapper;
import edu.tlu.jobplatform.company.infrastructure.persistence.repository.CompanyGalleryJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CompanyGalleryRepositoryAdapter implements CompanyGalleryRepository {

    private final CompanyGalleryJpaRepository jpaRepository;
    private final CompanyGalleryImageMapper mapper;

    @Override
    public CompanyGalleryImage save(CompanyGalleryImage image) {
        CompanyGalleryImageJpaEntity entity = jpaRepository.findById(image.getId())
                .map(existing -> {
                    mapper.updateEntity(existing, image);
                    return existing;
                })
                .orElseGet(() -> {
                    CompanyGalleryImageJpaEntity newEntity = mapper.toNewEntity(image);
                    newEntity.setId(image.getId());
                    return newEntity;
                });

        return mapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<CompanyGalleryImage> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<CompanyGalleryImage> findByCompanyId(UUID companyId) {
        return jpaRepository
                .findByCompanyIdOrderByDisplayOrderAsc(companyId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public int countByCompanyId(UUID companyId) {
        return jpaRepository.countByCompanyId(companyId);
    }

    @Override
    public Map<UUID, List<CompanyGalleryImage>> findByCompanyIds(Collection<UUID> companyIds) {
        if (companyIds == null || companyIds.isEmpty())
            return Map.of();
        return jpaRepository.findByCompanyIdIn(companyIds)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.groupingBy(CompanyGalleryImage::getCompanyId));
    }
}