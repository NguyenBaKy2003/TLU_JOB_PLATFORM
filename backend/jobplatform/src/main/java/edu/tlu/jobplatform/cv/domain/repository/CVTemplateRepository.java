package edu.tlu.jobplatform.cv.domain.repository;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CVTemplateRepository {

    List<CVTemplate> findAll();

    /** Chỉ trả về template đang active — dùng cho candidate */
    List<CVTemplate> findAllActive();

    List<CVTemplate> findByPremium(boolean premium);

    Optional<CVTemplate> findById(UUID id);

    CVTemplate save(CVTemplate template);

    void deleteById(UUID id);

    boolean existsById(UUID id);
}