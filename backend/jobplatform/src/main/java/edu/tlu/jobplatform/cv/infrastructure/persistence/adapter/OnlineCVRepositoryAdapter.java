package edu.tlu.jobplatform.cv.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.infrastructure.persistence.entity.OnlineCVJpaEntity;
import edu.tlu.jobplatform.cv.infrastructure.persistence.mapper.OnlineCVMapper;
import edu.tlu.jobplatform.cv.infrastructure.persistence.repository.OnlineCVJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OnlineCVRepositoryAdapter implements OnlineCVRepository {

    private final OnlineCVJpaRepository jpaRepo;
    private final OnlineCVMapper mapper;

    @Override
    public OnlineCV save(OnlineCV cv) {
        if (cv.getId() != null) {
            Optional<OnlineCVJpaEntity> existing = jpaRepo.findByIdWithSections(cv.getId());
            if (existing.isPresent()) {
                OnlineCVJpaEntity entity = existing.get();
                mapper.updateEntity(entity, cv);
                return mapper.toDomain(jpaRepo.save(entity));
            }
        }
        return mapper.toDomain(jpaRepo.save(mapper.toNewEntity(cv)));
    }

    @Override
    public Optional<OnlineCV> findById(UUID id) {
        // Dùng fetch với sections để tránh LazyInitializationException
        return jpaRepo.findByIdWithSections(id).map(mapper::toDomain);
    }

    @Override
    public Optional<OnlineCV> findBySlug(String slug) {
        return jpaRepo.findBySlugWithSections(slug).map(mapper::toDomain);
    }

    @Override
    public List<OnlineCV> findAllByCandidateId(UUID candidateId) {
        // Danh sách không cần sections → dùng query thường (nhẹ hơn)
        return jpaRepo.findAllByCandidateId(candidateId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return jpaRepo.existsBySlug(slug);
    }

    @Override
    public long countByCandidateId(UUID candidateId) {
        return jpaRepo.countByCandidateId(candidateId);
    }
}