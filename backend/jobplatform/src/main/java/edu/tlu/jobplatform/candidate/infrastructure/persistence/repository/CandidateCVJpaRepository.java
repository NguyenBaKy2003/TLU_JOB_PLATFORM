package edu.tlu.jobplatform.candidate.infrastructure.persistence.repository;

import edu.tlu.jobplatform.candidate.infrastructure.persistence.entity.CandidateCVJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateCVJpaRepository
        extends JpaRepository<CandidateCVJpaEntity, UUID> {

    List<CandidateCVJpaEntity> findAllByCandidateIdOrderByCreatedAtDesc(UUID candidateId);

    Optional<CandidateCVJpaEntity> findByCandidateIdAndPrimaryTrue(UUID candidateId);

    int countByCandidateId(UUID candidateId);
}