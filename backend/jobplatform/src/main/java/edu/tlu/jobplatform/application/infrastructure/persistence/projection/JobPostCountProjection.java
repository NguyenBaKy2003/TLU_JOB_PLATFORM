package edu.tlu.jobplatform.application.infrastructure.persistence.projection;

import java.util.UUID;

public interface JobPostCountProjection {
    UUID getJobPostId();

    Integer getCount();
}
