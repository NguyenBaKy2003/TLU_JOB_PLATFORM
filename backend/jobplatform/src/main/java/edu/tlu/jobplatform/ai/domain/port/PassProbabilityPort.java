package edu.tlu.jobplatform.ai.domain.port;

import edu.tlu.jobplatform.ai.domain.model.PassProbabilityRequest;
import edu.tlu.jobplatform.ai.domain.model.PassProbabilityResult;

public interface PassProbabilityPort {
    PassProbabilityResult calculate(PassProbabilityRequest request);
}
