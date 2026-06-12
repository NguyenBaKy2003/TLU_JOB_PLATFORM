package edu.tlu.jobplatform.ai.domain.port;

import java.util.List;

import edu.tlu.jobplatform.ai.domain.model.CandidateProfileSummary;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchRequest;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchResult;

public interface CandidateAutoSuggestPort {
    /**
     * Auto suggest: Từ JD đã đăng → AI tự tìm candidates phù hợp nhất.
     */
    CandidateSearchResult suggest(CandidateSearchRequest request,
            List<CandidateProfileSummary> candidatePool);
}
