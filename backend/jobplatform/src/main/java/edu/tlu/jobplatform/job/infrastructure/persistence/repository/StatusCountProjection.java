package edu.tlu.jobplatform.job.infrastructure.persistence.repository;

import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;

/**
 * Spring Data projection — ánh xạ kết quả GROUP BY query
 * SELECT j.status as status, COUNT(j) as count FROM ...
 */
public interface StatusCountProjection {
    JobStatus getStatus();

    Long getCount();
}