package edu.tlu.jobplatform.ai.domain.port;

import edu.tlu.jobplatform.ai.domain.model.CompetitionRateRequest;
import edu.tlu.jobplatform.ai.domain.model.CompetitionRateResult;

public interface JobCompetitionPort {
    CompetitionRateResult calculate(CompetitionRateRequest request);
}
