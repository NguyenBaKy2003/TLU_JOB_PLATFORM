package edu.tlu.jobplatform.ai.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Request gửi lên AI để phân tích CV vs JD.
 */
@Getter
@Builder
public class CvAnalysisRequest {

    private final UUID applicationId;
    private final String cvText; // Text extract từ CV (PDF → text)
    private final String jobTitle;
    private final String jobDescription;
    private final String jobRequirements;
    private final String jobLevel; // JUNIOR, MIDDLE, SENIOR...
}