package edu.tlu.jobplatform.application.infrastructure.persistence.repository;

import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.infrastructure.persistence.entity.ApplicationJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationJpaRepository extends JpaRepository<ApplicationJpaEntity, UUID> {
    boolean existsByJobPostIdAndCandidateId(UUID jobPostId, UUID candidateId);

    Page<ApplicationJpaEntity> findByCandidateId(UUID candidateId, Pageable p);

    Page<ApplicationJpaEntity> findByJobPostId(UUID jobPostId, Pageable p);

    Page<ApplicationJpaEntity> findByJobPostIdAndStatus(UUID jobPostId, ApplicationStatus status, Pageable p);

    Page<ApplicationJpaEntity> findByCompanyId(UUID companyId, Pageable p);

    Page<ApplicationJpaEntity> findByCompanyIdAndStatus(UUID companyId, ApplicationStatus status, Pageable pageable);

    Optional<ApplicationJpaEntity> findByJobPostIdAndCandidateId(UUID jobPostId, UUID candidateId);
}