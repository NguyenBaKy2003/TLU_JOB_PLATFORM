package edu.tlu.jobplatform.job.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.job.domain.model.SavedJob;
import edu.tlu.jobplatform.job.domain.repository.SavedJobRepository;
import edu.tlu.jobplatform.job.infrastructure.persistence.mapper.JobMapper;
import edu.tlu.jobplatform.job.infrastructure.persistence.repository.SavedJobJpaRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SavedJobRepositoryAdapter implements SavedJobRepository {

    private final SavedJobJpaRepo jpaRepo;
    private final JobMapper mapper;

    @Override
    public Optional<SavedJob> findByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId) {
        return jpaRepo.findByCandidateIdAndJobPostId(candidateId, jobPostId)
                .map(mapper::toSavedJobDomain);
    }

    @Override
    public List<SavedJob> findByCandidateId(UUID candidateId) {
        return jpaRepo.findByCandidateIdOrderBySavedAtDesc(candidateId)
                .stream().map(mapper::toSavedJobDomain).toList();
    }

    @Override
    public boolean existsByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId) {
        return jpaRepo.existsByCandidateIdAndJobPostId(candidateId, jobPostId);
    }

    @Override
    public SavedJob save(SavedJob savedJob) {
        return mapper.toSavedJobDomain(jpaRepo.save(mapper.toSavedJobEntity(savedJob)));
    }

    @Override
    public void deleteByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId) {
        jpaRepo.deleteByCandidateIdAndJobPostId(candidateId, jobPostId);
    }
}