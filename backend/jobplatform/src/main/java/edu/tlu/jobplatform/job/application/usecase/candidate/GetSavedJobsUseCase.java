package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.job.domain.model.SavedJob;
import edu.tlu.jobplatform.job.domain.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetSavedJobsUseCase {

    private final SavedJobRepository savedJobRepository;

    @Transactional(readOnly = true)
    public Page<SavedJob> execute(UUID candidateId, Pageable pageable) {
        return savedJobRepository.findByCandidateId(candidateId, pageable);
    }
}