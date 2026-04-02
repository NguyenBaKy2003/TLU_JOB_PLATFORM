package edu.tlu.jobplatform.job.infrastructure.persistence.repository;

import edu.tlu.jobplatform.job.infrastructure.persistence.entity.SavedJobJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobJpaRepo extends JpaRepository<SavedJobJpaEntity, UUID> {

    Optional<SavedJobJpaEntity> findByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    List<SavedJobJpaEntity> findByCandidateIdOrderBySavedAtDesc(UUID candidateId);

    boolean existsByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    void deleteByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);
}