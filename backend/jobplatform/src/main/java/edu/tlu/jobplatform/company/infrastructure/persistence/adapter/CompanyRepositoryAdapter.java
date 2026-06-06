package edu.tlu.jobplatform.company.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyJpaEntity;
import edu.tlu.jobplatform.company.infrastructure.persistence.mapper.CompanyMapper;
import edu.tlu.jobplatform.company.infrastructure.persistence.repository.CompanyJpaRepository;
import edu.tlu.jobplatform.company.infrastructure.persistence.repository.CompanyJpaRepository.CompanyStatsProjection;
import edu.tlu.jobplatform.company.infrastructure.persistence.repository.CompanyJpaRepository.CompanyJobCountProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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
    public boolean existsBySlug(String slug) {
        return jpaRepo.existsBySlug(slug);
    }

    @Override
    public boolean existsByName(String name) {
        return jpaRepo.existsByNameIgnoreCase(name);
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
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }

    @Override
    public List<CompanyProfile> findAllById(Collection<UUID> ids) {
        return jpaRepo.findAllById(ids).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Page<CompanyProfile> findAll(Pageable pageable) {
        return jpaRepo.findAll(pageable).map(mapper::toDomain);
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
        return jpaRepo.findAllByOwnerIdIn(ownerIds).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<CompanyProfile> findByNamesIgnoreCase(List<String> names) {
        if (names == null || names.isEmpty())
            return List.of();
        return jpaRepo.findByNamesIgnoreCase(names.stream().map(String::toLowerCase).toList())
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public Page<CompanyProfile> findVerifiedCompaniesWithOpenJobs(Pageable pageable) {
        return jpaRepo.findVerifiedCompaniesWithOpenJobs(pageable).map(mapper::toDomain);
    }

    @Override
    public Map<UUID, Long> countOpenJobsByCompanyIds(Set<UUID> companyIds) {
        if (companyIds == null || companyIds.isEmpty())
            return Map.of();
        return jpaRepo.countOpenJobsByCompanyIds(companyIds).stream()
                .collect(Collectors.toMap(
                        CompanyJobCountProjection::getCompanyId,
                        CompanyJobCountProjection::getCount));
    }

    @Override
    public void enrichWithStats(CompanyProfile company) {
        jpaRepo.findStatsByCompanyId(company.getId())
                .ifPresent(s -> company.setStatistics(
                        s.getActiveJobCount(), round(s.getAverageRating()), s.getReviewCount()));
    }

    @Override
    public void enrichWithStats(List<CompanyProfile> companies) {
        if (companies == null || companies.isEmpty())
            return;
        Set<UUID> ids = companies.stream().map(CompanyProfile::getId).collect(Collectors.toSet());
        Map<UUID, CompanyStatsProjection> statsMap = jpaRepo.findStatsByCompanyIds(ids)
                .stream().collect(Collectors.toMap(CompanyStatsProjection::getCompanyId, s -> s));
        companies.forEach(c -> {
            CompanyStatsProjection s = statsMap.get(c.getId());
            if (s != null)
                c.setStatistics(s.getActiveJobCount(), round(s.getAverageRating()), s.getReviewCount());
        });
    }

    // ── Plan-tier sort ───────

    @Override
    public Page<CompanyProfile> findVerifiedCompaniesSortedByPlan(Pageable pageable) {
        return jpaRepo.findVerifiedCompaniesSortedByPlan(pageable).map(mapper::toDomain);
    }

    @Override
    public Map<UUID, String> findActivePlanCodesByCompanyIds(Set<UUID> companyIds) {
        if (companyIds == null || companyIds.isEmpty())
            return Map.of();
        return jpaRepo.findActivePlanCodesByCompanyIds(companyIds).stream()
                .collect(Collectors.toMap(
                        row -> UUID.fromString(row[0].toString()),
                        row -> row[1].toString(),
                        (existing, replacement) -> existing));
    }

    // ── Multi-criteria search

    @Override
    public Page<CompanyProfile> search(
            String keyword, String city, String size, String planCode,
            Double minRating, Pageable pageable) {
        return jpaRepo.search(keyword, city, size, planCode, minRating, pageable)
                .map(mapper::toDomain);
    }

    // ── Helpers ──────────────

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    @Override
    public Page<CompanyProfile> adminSearch(
            String status, String keyword, String city, String size,
            String planCode, Double minRating, Pageable pageable) {
        return jpaRepo.adminSearch(status, keyword, city, size, planCode, minRating, pageable)
                .map(mapper::toDomain);
    }
}