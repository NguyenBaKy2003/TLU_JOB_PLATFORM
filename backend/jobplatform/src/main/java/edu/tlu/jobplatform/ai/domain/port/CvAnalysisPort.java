package edu.tlu.jobplatform.ai.domain.port;

import edu.tlu.jobplatform.ai.domain.model.CvAnalysisRequest;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisResult;

/**
 * Output Port: Phân tích CV bằng AI.
 *
 * Implementations:
 * OpenAICvAnalysisAdapter — gọi OpenAI GPT-4o-mini
 * MockCvAnalysisAdapter — dùng cho test
 */
public interface CvAnalysisPort {
    CvAnalysisResult analyze(CvAnalysisRequest request);
}