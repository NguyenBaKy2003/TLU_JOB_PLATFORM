package edu.tlu.jobplatform.ai.infrastructure.adapter;

import org.springframework.stereotype.Component;

import edu.tlu.jobplatform.ai.domain.model.CompetitionRateRequest;
import edu.tlu.jobplatform.ai.domain.model.CompetitionRateResult;
import edu.tlu.jobplatform.ai.domain.port.JobCompetitionPort;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class HybridCompetitionAdapter implements JobCompetitionPort {

    private final CompetitionScoreEngine scoreEngine;

    @Override
    public CompetitionRateResult calculate(CompetitionRateRequest request) {
        return scoreEngine.calculate(request);
    }
}
