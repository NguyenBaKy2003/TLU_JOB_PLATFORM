package edu.tlu.jobplatform.job.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.job.domain.model.SavedJob;
import edu.tlu.jobplatform.job.domain.repository.SavedJobRepository;
import edu.tlu.jobplatform.job.infrastructure.persistence.mapper.JobMapper;
import edu.tlu.jobplatform.job.infrastructure.persistence.repository.SavedJobJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SavedJobRepositoryAdapter implements SavedJobRepository {

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
    public Page<SavedJob> searchByCandidateId(
            UUID candidateId,
            String keyword,
            String jobType,
            String category,
            LocalDateTime savedAtFrom,
            LocalDateTime savedAtTo,
            Pageable pageable) {

        return jpaRepo.searchByCandidateId(
                candidateId,
                normalize(keyword),
                normalize(jobType),
                normalize(category),
                savedAtFrom,
                savedAtTo,
                pageable).map(mapper::toSavedJobDomain);
    }

    @Override
    public Map<String, Long> countByCategoryForCandidate(UUID candidateId) {
        return jpaRepo.countByCategoryForCandidate(candidateId)
                .stream()
                .collect(Collectors.toMap(
                        p -> p.getCategory() != null ? p.getCategory() : "Khác",
                        p -> p.getCount()));
    }

    @Override
    public SavedJob save(SavedJob savedJob) {
        return mapper.toSavedJobDomain(jpaRepo.save(mapper.toSavedJobEntity(savedJob)));
    }

    @Override
    public void deleteByCandidateIdAndJobPostId(UUID cid, UUID jid) {
        jpaRepo.deleteByCandidateIdAndJobPostId(cid, jid);
    }

    /** null/blank → null để JPQL bỏ qua điều kiện */
    private String normalize(String s) {
        return StringUtils.hasText(s) ? s.trim() : null;
    }
}