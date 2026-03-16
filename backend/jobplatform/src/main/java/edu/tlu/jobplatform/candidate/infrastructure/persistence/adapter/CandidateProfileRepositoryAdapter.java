package edu.tlu.jobplatform.candidate.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.entity.CandidateProfileJpaEntity;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.mapper.CandidateMapper;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.repository.CandidateProfileJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CandidateProfileRepositoryAdapter implements CandidateProfileRepository {

    private final CandidateProfileJpaRepository jpaRepo;
    private final CandidateMapper mapper;

    @Override
    public Optional<CandidateProfile> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<CandidateProfile> findByUserId(UUID userId) {
        // Dùng query fetch JOIN để tránh N+1
        return jpaRepo.findByUserIdWithDetails(userId).map(mapper::toDomain);
    }

    @Override
    public boolean existsByUserId(UUID userId) {
        return jpaRepo.existsByUserId(userId);
    }

    @Override
    public CandidateProfile save(CandidateProfile profile) {
        if (profile.getId() != null) {
            Optional<CandidateProfileJpaEntity> existing = jpaRepo.findById(profile.getId());
            if (existing.isPresent()) {
                CandidateProfileJpaEntity entity = existing.get();
                mapper.updateEntity(entity, profile);
                return mapper.toDomain(jpaRepo.save(entity));
            }
        }
        CandidateProfileJpaEntity newEntity = mapper.toNewEntity(profile);
        return mapper.toDomain(jpaRepo.save(newEntity));
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}