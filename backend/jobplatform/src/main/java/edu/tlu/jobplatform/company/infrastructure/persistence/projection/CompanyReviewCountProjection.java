package edu.tlu.jobplatform.company.infrastructure.persistence.projection;

import edu.tlu.jobplatform.company.domain.model.ReviewStatus;

public interface CompanyReviewCountProjection {
    ReviewStatus getStatus();

    Long getCount();
}