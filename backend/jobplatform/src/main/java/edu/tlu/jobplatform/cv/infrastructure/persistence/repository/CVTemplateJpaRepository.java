package edu.tlu.jobplatform.cv.infrastructure.persistence.repository;

import edu.tlu.jobplatform.cv.infrastructure.persistence.entity.CVTemplateJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CVTemplateJpaRepository extends JpaRepository<CVTemplateJpaEntity, UUID> {

    List<CVTemplateJpaEntity> findByPremium(boolean premium);
}