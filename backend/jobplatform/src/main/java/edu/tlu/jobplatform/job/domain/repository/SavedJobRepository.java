package edu.tlu.jobplatform.job.domain.repository;

import edu.tlu.jobplatform.job.domain.model.SavedJob;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedJobRepository {

    Optional<SavedJob> findByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    List<SavedJob> findByCandidateId(UUID candidateId);

    boolean existsByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    SavedJob save(SavedJob savedJob);

    void deleteByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);
}