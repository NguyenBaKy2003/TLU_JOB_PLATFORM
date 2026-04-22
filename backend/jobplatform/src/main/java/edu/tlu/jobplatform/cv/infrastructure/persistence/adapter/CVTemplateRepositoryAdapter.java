package edu.tlu.jobplatform.cv.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.cv.infrastructure.persistence.mapper.OnlineCVMapper;
import edu.tlu.jobplatform.cv.infrastructure.persistence.repository.CVTemplateJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CVTemplateRepositoryAdapter implements CVTemplateRepository {

    private final CVTemplateJpaRepository jpaRepo;
    private final OnlineCVMapper mapper;

    @Override
    public List<CVTemplate> findAll() {
        return jpaRepo.findAll().stream().map(mapper::templateToDomain).toList();
    }

    @Override
    public List<CVTemplate> findByPremium(boolean premium) {
        return jpaRepo.findByPremium(premium).stream().map(mapper::templateToDomain).toList();
    }

    @Override
    public Optional<CVTemplate> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::templateToDomain);
    }
}