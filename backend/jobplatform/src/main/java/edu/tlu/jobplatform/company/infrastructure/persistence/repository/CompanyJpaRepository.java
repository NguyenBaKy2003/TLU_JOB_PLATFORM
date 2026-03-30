package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyJpaRepository extends JpaRepository<CompanyJpaEntity, UUID> {

    Optional<CompanyJpaEntity> findByOwnerId(UUID ownerId);

    Optional<CompanyJpaEntity> findBySlug(String slug);

    boolean existsByOwnerId(UUID ownerId);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    Page<CompanyJpaEntity> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    Page<CompanyJpaEntity> findByVerificationStatusAndIsActiveTrue(
            VerificationStatus status, Pageable pageable);
}