package edu.tlu.jobplatform.application.infrastructure.persistence.projection;

import java.util.UUID;

public interface JobPostAvgScoreProjection {
    UUID getJobPostId();

    Double getAvgScore();
}