package edu.tlu.jobplatform.company.domain.repository;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

/**
 * Port (interface) truy cập CompanyProfile data.
 * Implementation: CompanyRepositoryAdapter (infrastructure/persistence).
 */
public interface CompanyRepository {

    Optional<CompanyProfile> findById(UUID id);

    Optional<CompanyProfile> findByOwnerId(UUID ownerId);

    Optional<CompanyProfile> findBySlug(String slug);

    boolean existsByOwnerId(UUID ownerId);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    /** Danh sách công ty theo trạng thái xác thực — Admin dùng */
    Page<CompanyProfile> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    /** Danh sách công ty đã xác thực — Public */
    Page<CompanyProfile> findVerifiedCompanies(Pageable pageable);

    CompanyProfile save(CompanyProfile company);
}