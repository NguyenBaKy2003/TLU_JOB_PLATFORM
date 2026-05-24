package edu.tlu.jobplatform.ai.domain.port;

import edu.tlu.jobplatform.ai.domain.model.CvOptimizationRequest;
import edu.tlu.jobplatform.ai.domain.model.CvOptimizationResult;

/**
 * Output Port: AI tối ưu CV theo JD.
 *
 * Đối xứng với JdOptimizationPort (Employer tối ưu JD).
 *
 * Implementation: OpenAiCvOptimizeAdapter (ai/infrastructure/openai)
 * Dùng Spring AI ChatClient + prompt file cv-optimizer.st
 *
 * Được gọi từ:
 * - AiOptimizeCVUseCase (cv domain)
 * - Tương lai: batch re-score khi JD thay đổi
 */
public interface CvOptimizationPort {

    CvOptimizationResult optimize(CvOptimizationRequest request);
}