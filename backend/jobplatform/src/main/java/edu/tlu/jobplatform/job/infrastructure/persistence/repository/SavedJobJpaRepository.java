package edu.tlu.jobplatform.job.infrastructure.persistence.repository;

import edu.tlu.jobplatform.job.infrastructure.persistence.entity.SavedJobJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobJpaRepository extends JpaRepository<SavedJobJpaEntity, UUID> {

    Optional<SavedJobJpaEntity> findByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    boolean existsByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    Page<SavedJobJpaEntity> findByCandidateId(UUID candidateId, Pageable pageable);

    void deleteByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);
}