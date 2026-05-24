package edu.tlu.jobplatform.cv.application.port.out;

import edu.tlu.jobplatform.ai.domain.model.CvOptimizationRequest;
import edu.tlu.jobplatform.ai.domain.model.CvOptimizationResult;

/**
 * Output Port (CV domain → AI domain).
 *
 * CV domain không gọi thẳng CvOptimizationPort (AI domain port)
 * để tránh cross-domain dependency.
 *
 * AiCvOptimizePort là "anti-corruption layer":
 * cv/application/port/out/AiCvOptimizePort
 * ↓ (adapter trong ai/infrastructure)
 * ai/domain/port/CvOptimizationPort
 * ↓
 * ai/infrastructure/openai/OpenAiCvOptimizeAdapter
 *
 * Pattern này nhất quán với cách AIScorePort (application domain)
 * được bridge sang ai/domain/port/CvAnalysisPort.
 */
public interface AiCvOptimizePort {

    CvOptimizationResult optimize(CvOptimizationRequest request);
}