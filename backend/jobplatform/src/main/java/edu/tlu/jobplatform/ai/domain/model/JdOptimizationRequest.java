package edu.tlu.jobplatform.ai.domain.model;

import lombok.Builder;
import lombok.Getter;

/**
 * Request tối ưu hóa JD bằng AI.
 */
@Getter
@Builder
public class JdOptimizationRequest {
    private final String originalTitle;
    private final String originalDescription;
    private final String originalRequirements;
    private final String originBenefits;
    private final String level; // JUNIOR, MIDDLE, SENIOR
    private final String category; // Ngành nghề
}
