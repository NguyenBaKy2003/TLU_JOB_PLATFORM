package edu.tlu.jobplatform.application.infrastructure.persistence.projection;

public interface ApplicationStatsProjection {
    Integer getTotalApply(); // int → Integer

    Integer getTotalPass(); // int → Integer

    Integer getCurrentApplicantCount(); // int → Integer
}