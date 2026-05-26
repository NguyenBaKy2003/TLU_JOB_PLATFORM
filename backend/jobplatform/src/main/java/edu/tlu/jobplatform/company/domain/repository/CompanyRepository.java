package edu.tlu.jobplatform.company.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface CompanyRepository {

    Optional<CompanyProfile> findById(UUID id);

    Optional<CompanyProfile> findByOwnerId(UUID ownerId);

    List<CompanyProfile> findAllById(Collection<UUID> ids);

    Optional<CompanyProfile> findBySlug(String slug);

    boolean existsByOwnerId(UUID ownerId);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    long countAll();

    long countByVerificationStatus(VerificationStatus status);

    Page<CompanyProfile> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    Page<CompanyProfile> findVerifiedCompanies(Pageable pageable);

    CompanyProfile save(CompanyProfile company);

    List<CompanyProfile> findAllByOwnerIdIn(Collection<UUID> ownerIds);

    Page<CompanyProfile> findAll(Pageable pageable);

    void deleteById(UUID id);

    Page<CompanyProfile> findVerifiedCompaniesWithOpenJobs(Pageable pageable);

    /** Batch lookup theo tên — dùng cho AI enrichment */
    List<CompanyProfile> findByNamesIgnoreCase(List<String> names);

    /** Đếm PUBLISHED jobs theo từng companyId — dùng cho AI enrichment */
    Map<UUID, Long> countOpenJobsByCompanyIds(Set<UUID> companyIds);

    /** Gán stats vào một CompanyProfile */
    void enrichWithStats(CompanyProfile company);

    /** Gán stats batch vào danh sách — dùng cho list page */
    void enrichWithStats(List<CompanyProfile> companies);
}