package edu.tlu.jobplatform.cv.domain.repository;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CVTemplateRepository {

    List<CVTemplate> findAll();

    List<CVTemplate> findByPremium(boolean premium);

    Optional<CVTemplate> findById(UUID id);
}