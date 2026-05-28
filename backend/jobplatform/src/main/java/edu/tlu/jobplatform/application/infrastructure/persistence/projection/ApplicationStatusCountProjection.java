package edu.tlu.jobplatform.application.infrastructure.persistence.projection;

import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;

public interface ApplicationStatusCountProjection {
    ApplicationStatus getStatus();

    Long getCount();
}