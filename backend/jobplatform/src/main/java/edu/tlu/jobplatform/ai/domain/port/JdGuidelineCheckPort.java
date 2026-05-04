package edu.tlu.jobplatform.ai.domain.port;

import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckRequest;
import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckResult;

public interface JdGuidelineCheckPort {
    JdGuidelineCheckResult check(JdGuidelineCheckRequest request);
}
