package edu.tlu.jobplatform.ai.domain.port;

import java.util.List;

import edu.tlu.jobplatform.ai.domain.model.CandidateProfileSummary;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchRequest;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchResult;

public interface CandidateSearchPort {
    /**
     * Smart search: Employer nhập query tự nhiên → AI parse → rank candidates.
     */
    CandidateSearchResult search(CandidateSearchRequest request,
            List<CandidateProfileSummary> candidatePool);
}