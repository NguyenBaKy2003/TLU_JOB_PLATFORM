package edu.tlu.jobplatform.application.domain.repository;

import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;

import java.util.List;
import java.util.UUID;

public interface ApplicationStatusLogRepository {
    List<ApplicationStatusLog> findByApplicationId(UUID applicationId);

    ApplicationStatusLog save(ApplicationStatusLog log);
}