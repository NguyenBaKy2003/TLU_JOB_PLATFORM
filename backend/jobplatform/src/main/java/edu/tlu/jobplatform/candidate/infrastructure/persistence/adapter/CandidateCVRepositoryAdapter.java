package edu.tlu.jobplatform.candidate.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.entity.CandidateCVJpaEntity;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.mapper.CandidateMapper;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.repository.CandidateCVJpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CandidateCVRepositoryAdapter implements CandidateCVRepository {

    private final CandidateCVJpaRepository jpaRepo;
    private final CandidateMapper mapper;

    @Override
    public Optional<CandidateCV> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<CandidateCV> findAllByCandidateId(UUID candidateId) {
        return jpaRepo.findAllByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<CandidateCV> findPrimaryByCandidateId(UUID candidateId) {
        return jpaRepo.findByCandidateIdAndPrimaryTrue(candidateId)
                .map(mapper::toDomain);
    }

    @Override
    public int countByCandidateId(UUID candidateId) {
        return jpaRepo.countByCandidateId(candidateId);
    }

    @Override
    public CandidateCV save(CandidateCV cv) {
        if (cv.getId() != null) {
            Optional<CandidateCVJpaEntity> existing = jpaRepo.findById(cv.getId());
            if (existing.isPresent()) {
                CandidateCVJpaEntity entity = existing.get();
                mapper.updateCVEntity(entity, cv);
                return mapper.toDomain(jpaRepo.save(entity));
            }
        }
        return mapper.toDomain(jpaRepo.save(mapper.toNewEntity(cv)));
    }

    @Override
    public void saveAll(List<CandidateCV> cvs) {
        List<UUID> ids = cvs.stream()
                .filter(cv -> cv.getId() != null)
                .map(CandidateCV::getId).toList();

        List<CandidateCVJpaEntity> entities = jpaRepo.findAllById(ids);

        entities.forEach(entity -> cvs.stream()
                .filter(cv -> cv.getId().equals(entity.getId()))
                .findFirst()
                .ifPresent(cv -> mapper.updateCVEntity(entity, cv)));

        jpaRepo.saveAll(entities);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}