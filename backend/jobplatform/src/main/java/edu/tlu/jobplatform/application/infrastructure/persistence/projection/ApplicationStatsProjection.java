package edu.tlu.jobplatform.application.infrastructure.persistence.projection;

public interface ApplicationStatsProjection {
    Integer getTotalApply();

    Integer getTotalPass();

    Integer getCurrentApplicantCount();
}