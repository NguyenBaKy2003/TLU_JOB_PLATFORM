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

    /**
     * Batch-update chỉ field `primary` — dùng khi SetPrimaryCVUseCase unmark/mark
     * primary.
     *
     * KHÔNG dùng updateEntity (full mapper) vì:
     * - findAllByCandidateId không fetch sections (lazy)
     * - updateEntity gọi getSections().clear() → xóa sections trong DB
     * - Chỉ cần update đúng 1 field is_primary, không cần động đến phần còn lại
     */
    @Override
    public void saveAll(List<OnlineCV> cvs) {
        if (cvs.isEmpty())
            return;

        List<UUID> ids = cvs.stream()
                .filter(cv -> cv.getId() != null)
                .map(OnlineCV::getId)
                .toList();

        List<OnlineCVJpaEntity> entities = jpaRepo.findAllById(ids);

        entities.forEach(entity -> cvs.stream()
                .filter(cv -> cv.getId().equals(entity.getId()))
                .findFirst()
                .ifPresent(cv -> entity.setPrimary(cv.isPrimary())));

        jpaRepo.saveAll(entities);
    }

    @Override
    public Optional<OnlineCV> findById(UUID id) {
        return jpaRepo.findByIdWithSections(id).map(mapper::toDomain);
    }

    @Override
    public Optional<OnlineCV> findBySlug(String slug) {
        return jpaRepo.findBySlugWithSections(slug).map(mapper::toDomain);
    }

    @Override
    public List<OnlineCV> findAllByCandidateId(UUID candidateId) {
        return jpaRepo.findAllByCandidateId(candidateId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<OnlineCV> findPublishedByCandidateId(UUID candidateId) {
        return jpaRepo.findPublishedByCandidateId(candidateId)
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