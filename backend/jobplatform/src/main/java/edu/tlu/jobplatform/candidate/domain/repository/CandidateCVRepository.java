package edu.tlu.jobplatform.candidate.domain.repository;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateCVRepository {

    Optional<CandidateCV> findById(UUID id);

    List<CandidateCV> findAllByCandidateId(UUID candidateId);

    Optional<CandidateCV> findPrimaryByCandidateId(UUID candidateId);

    int countByCandidateId(UUID candidateId);

    CandidateCV save(CandidateCV cv);

    void saveAll(List<CandidateCV> cvs);

    void deleteById(UUID id);
}