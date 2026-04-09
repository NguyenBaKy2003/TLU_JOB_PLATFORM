package edu.tlu.jobplatform.application.infrastructure.persistence.repository;

import edu.tlu.jobplatform.application.infrastructure.persistence.entity.ApplicationStatusLogJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationStatusLogJpaRepository
        extends JpaRepository<ApplicationStatusLogJpaEntity, UUID> {
    List<ApplicationStatusLogJpaEntity> findByApplicationIdOrderByChangedAtAsc(UUID applicationId);
}