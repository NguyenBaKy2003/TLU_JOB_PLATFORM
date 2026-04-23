package edu.tlu.jobplatform.cv.infrastructure.persistence.repository;

import edu.tlu.jobplatform.cv.infrastructure.persistence.entity.CVTemplateJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CVTemplateJpaRepository extends JpaRepository<CVTemplateJpaEntity, UUID> {

    List<CVTemplateJpaEntity> findByPremium(boolean premium);

    List<CVTemplateJpaEntity> findAllByIsActiveTrue();
}