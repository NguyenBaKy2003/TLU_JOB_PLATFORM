package edu.tlu.jobplatform.cv.domain.repository;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port ra ngoài — interface thuần domain.
 * Infrastructure layer implement bằng JPA/adapter.
 */
public interface OnlineCVRepository {

    OnlineCV save(OnlineCV cv);

    void saveAll(List<OnlineCV> cvs);

    Optional<OnlineCV> findById(UUID id);

    Optional<OnlineCV> findBySlug(String slug);

    List<OnlineCV> findAllByCandidateId(UUID candidateId);

    List<OnlineCV> findPublishedByCandidateId(UUID candidateId);

    void deleteById(UUID id);

    boolean existsBySlug(String slug);

    long countByCandidateId(UUID candidateId);
}