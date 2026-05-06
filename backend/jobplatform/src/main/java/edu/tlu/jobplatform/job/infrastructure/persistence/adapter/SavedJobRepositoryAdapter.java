package edu.tlu.jobplatform.job.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.job.domain.model.SavedJob;
import edu.tlu.jobplatform.job.domain.repository.SavedJobRepository;
import edu.tlu.jobplatform.job.infrastructure.persistence.mapper.JobMapper;
import edu.tlu.jobplatform.job.infrastructure.persistence.repository.SavedJobJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

// ── SavedJobRepositoryAdapter ─

@Component
@RequiredArgsConstructor
class SavedJobRepositoryAdapter implements SavedJobRepository {

    private final SavedJobJpaRepository jpaRepo;
    private final JobMapper mapper;

    @Override
    public Optional<SavedJob> findByCandidateIdAndJobPostId(UUID cid, UUID jid) {
        return jpaRepo.findByCandidateIdAndJobPostId(cid, jid).map(mapper::toSavedJobDomain);
    }

    @Override
    public boolean existsByCandidateIdAndJobPostId(UUID cid, UUID jid) {
        return jpaRepo.existsByCandidateIdAndJobPostId(cid, jid);
    }

    @Override
    public Page<SavedJob> findByCandidateId(UUID candidateId, Pageable p) {
        return jpaRepo.findByCandidateId(candidateId, p).map(mapper::toSavedJobDomain);
    }

    @Override
    public SavedJob save(SavedJob savedJob) {
        return mapper.toSavedJobDomain(jpaRepo.save(mapper.toSavedJobEntity(savedJob)));
    }

    @Override
    public void deleteByCandidateIdAndJobPostId(UUID cid, UUID jid) {
        jpaRepo.deleteByCandidateIdAndJobPostId(cid, jid);
    }
}