package edu.tlu.jobplatform.auth.candidate.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import edu.tlu.jobplatform.auth.candidate.domain.model.CandidateCV;

public interface CandidateCVRepository {

    Optional<CandidateCV> findById(UUID id);

    List<CandidateCV> findAllByCandidateId(UUID candidateId);

    Optional<CandidateCV> findPrimaryByCandidateId(UUID candidateId);

    int countByCandidateId(UUID candidateId);

    CandidateCV save(CandidateCV cv);

    void saveAll(List<CandidateCV> cvs);

    void deleteById(UUID id);
}