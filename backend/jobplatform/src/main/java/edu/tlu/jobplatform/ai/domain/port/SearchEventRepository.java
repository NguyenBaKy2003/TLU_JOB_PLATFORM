package edu.tlu.jobplatform.ai.domain.port;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import edu.tlu.jobplatform.ai.domain.model.SearchEvent;

public interface SearchEventRepository {
        SearchEvent save(SearchEvent event);

        List<String> findKeywordsByCandidate(UUID candidateId,
                        LocalDateTime since, int limit);

        void saveCompanyView(UUID candidateId, UUID companyId);

        List<String> findTopViewedJobTitles(UUID candidateId,
                        LocalDateTime since, int limit);

        List<String> findAppliedJobTitles(UUID candidateId);

        List<String> findSavedJobTitles(UUID candidateId);

        List<String> findRecentKeywordsByCandidate(UUID candidateId, int limit);
}