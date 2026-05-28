package edu.tlu.jobplatform.job.infrastructure.persistence.projection;

public interface SavedJobCountProjection {
    String getCategory();

    Long getCount();
}