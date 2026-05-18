package edu.tlu.jobplatform.ai.domain.port;

import edu.tlu.jobplatform.ai.domain.model.CandidateTrendRequest;
import edu.tlu.jobplatform.ai.domain.model.CompanyRecommendResult;
import edu.tlu.jobplatform.ai.domain.model.JobRecommendResult;

public interface CandidateTrendAnalysisPort {
    JobRecommendResult recommendJobs(CandidateTrendRequest request);

    CompanyRecommendResult recommendCompanies(CandidateTrendRequest request);
}
