package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface CompanyJpaRepository extends JpaRepository<CompanyJpaEntity, UUID> {

    Optional<CompanyJpaEntity> findByOwnerId(UUID ownerId);

    Optional<CompanyJpaEntity> findBySlug(String slug);

    boolean existsByOwnerId(UUID ownerId);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    long countByVerificationStatus(VerificationStatus status);

    Page<CompanyJpaEntity> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    Page<CompanyJpaEntity> findByVerificationStatusAndIsActiveTrue(VerificationStatus status, Pageable pageable);

    List<CompanyJpaEntity> findAllByOwnerIdIn(Collection<UUID> ownerIds);

    /** Batch lookup theo tên, case-insensitive */
    @Query("SELECT c FROM CompanyJpaEntity c WHERE LOWER(c.name) IN :names AND c.isActive = true")
    List<CompanyJpaEntity> findByNamesIgnoreCase(@Param("names") List<String> names);

    /** Đếm job PUBLISHED theo companyId — projection tránh N+1 */
    @Query("""
            SELECT j.companyId AS companyId, COUNT(j) AS count
            FROM JobPostJpaEntity j
            WHERE j.companyId IN :companyIds
              AND j.status = 'PUBLISHED'
              AND j.isActive = true
            GROUP BY j.companyId
            """)
    List<CompanyJobCountProjection> countOpenJobsByCompanyIds(@Param("companyIds") Set<UUID> companyIds);

    interface CompanyJobCountProjection {
        UUID getCompanyId();

        Long getCount();
    }

    @Query("""
            SELECT DISTINCT c FROM CompanyJpaEntity c
            WHERE c.verificationStatus = 'VERIFIED'
              AND c.isActive = true
              AND EXISTS (
                  SELECT 1 FROM JobPostJpaEntity j
                  WHERE j.companyId = c.id
                    AND j.status = 'PUBLISHED'
                    AND j.isActive = true
              )
            ORDER BY c.name ASC
            """)
    Page<CompanyJpaEntity> findVerifiedWithOpenJobs(Pageable pageable);
}