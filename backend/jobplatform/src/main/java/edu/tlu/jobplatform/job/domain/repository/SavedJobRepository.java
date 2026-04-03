package edu.tlu.jobplatform.job.domain.repository;

import edu.tlu.jobplatform.job.domain.model.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface SavedJobRepository {

    Optional<SavedJob> findByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    boolean existsByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    Page<SavedJob> findByCandidateId(UUID candidateId, Pageable pageable);

    SavedJob save(SavedJob savedJob);

    void deleteByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);
}