package edu.tlu.jobplatform.ai.domain.port;

import edu.tlu.jobplatform.ai.domain.model.CandidateComparisonRequest;
import edu.tlu.jobplatform.ai.domain.model.CandidateComparisonResult;

public interface CandidateComparisonPort {
    CandidateComparisonResult compare(CandidateComparisonRequest request);
}