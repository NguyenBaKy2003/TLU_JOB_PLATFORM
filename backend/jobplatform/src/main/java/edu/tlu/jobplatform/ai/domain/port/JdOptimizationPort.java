package edu.tlu.jobplatform.ai.domain.port;

import edu.tlu.jobplatform.ai.domain.model.JdOptimizationRequest;
import edu.tlu.jobplatform.ai.domain.model.JdOptimizationResult;

/**
 * Output Port: Tối ưu hóa Job Description bằng AI.
 *
 * Employer nhập JD thô → AI trả về JD được cải thiện.
 */
public interface JdOptimizationPort {
    JdOptimizationResult optimize(JdOptimizationRequest request);
}
