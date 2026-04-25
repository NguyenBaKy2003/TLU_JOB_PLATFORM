package edu.tlu.jobplatform.company.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port (interface) truy cập CompanyProfile data.
 * Implementation: CompanyRepositoryAdapter (infrastructure/persistence).
 */
public interface CompanyRepository {

    Optional<CompanyProfile> findById(UUID id);

    Optional<CompanyProfile> findByOwnerId(UUID ownerId);

    List<CompanyProfile> findAllById(Collection<UUID> ids);

    Optional<CompanyProfile> findBySlug(String slug);

    boolean existsByOwnerId(UUID ownerId);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    long countAll(); // thêm

    long countByVerificationStatus(VerificationStatus status); // thêm

    Page<CompanyProfile> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    Page<CompanyProfile> findVerifiedCompanies(Pageable pageable);

    CompanyProfile save(CompanyProfile company);

    List<CompanyProfile> findAllByOwnerIdIn(Collection<UUID> ownerIds);

    Page<CompanyProfile> findAll(Pageable pageable);

    void deleteById(UUID id);
}