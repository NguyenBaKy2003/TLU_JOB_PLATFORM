package edu.tlu.jobplatform.ai.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.ai.domain.model.SearchEvent;
import edu.tlu.jobplatform.ai.domain.port.SearchEventRepository;
import edu.tlu.jobplatform.ai.infrastructure.persistence.entity.SearchEventJpaEntity;
import edu.tlu.jobplatform.ai.infrastructure.persistence.repository.SearchEventJpaRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SearchEventRepositoryAdapter implements SearchEventRepository {

    private final SearchEventJpaRepository jpaRepo;

    @Override
    public SearchEvent save(SearchEvent event) {
        SearchEventJpaEntity entity = SearchEventJpaEntity.builder()
                .id(event.getId())
                .candidateId(event.getCandidateId())
                .eventType(event.getEventType())
                .keyword(event.getKeyword())
                .jobPostId(event.getJobPostId())
                .companyId(event.getCompanyId())
                .dwellSeconds(event.getDwellSeconds())
                .occurredAt(event.getOccurredAt())
                .build();
        jpaRepo.save(entity);
        return event;
    }

    @Override
    public List<String> findKeywordsByCandidate(UUID candidateId, LocalDateTime since, int limit) {
        return jpaRepo.findKeywordsByCandidate(
                candidateId, since, PageRequest.of(0, limit));
    }

    @Override
    public List<String> findTopViewedJobTitles(UUID candidateId, LocalDateTime since, int limit) {
        return jpaRepo.findTopViewedJobTitles(
                candidateId, since, PageRequest.of(0, limit)); //
    }

    @Override
    public List<String> findAppliedJobTitles(UUID candidateId) {
        return jpaRepo.findAppliedJobTitles(candidateId);
    }

    @Override
    public List<String> findSavedJobTitles(UUID candidateId) {
        return jpaRepo.findSavedJobTitles(candidateId);
    }

    @Override
    public List<String> findRecentKeywordsByCandidate(UUID candidateId, int limit) {
        return jpaRepo.findRecentKeywords(
                candidateId, PageRequest.of(0, limit)); //
    }

    @Override
    public void saveCompanyView(UUID candidateId, UUID companyId) {
        SearchEventJpaEntity entity = SearchEventJpaEntity.builder()
                .id(UUID.randomUUID())
                .candidateId(candidateId)
                .eventType(SearchEvent.EventType.COMPANY_VIEW)
                .companyId(companyId)
                .occurredAt(LocalDateTime.now())
                .build();
        jpaRepo.save(entity);
    }
}