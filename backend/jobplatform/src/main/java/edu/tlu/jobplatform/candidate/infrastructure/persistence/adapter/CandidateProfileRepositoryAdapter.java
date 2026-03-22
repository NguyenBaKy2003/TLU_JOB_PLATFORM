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
                return jpaRepo.findByUserIdWithDetails(userId).map(mapper::toDomain);
        }

        @Override
        public boolean existsByUserId(UUID userId) {
                return jpaRepo.existsByUserId(userId);
        }

        @Override
        public boolean existsByProfileUrl(String profileUrl) {
                return jpaRepo.existsByProfileUrl(profileUrl);
        }

        @Override
        public Optional<CandidateProfile> findByProfileUrl(String profileUrl) {
                // Dùng query đơn giản (không cần fetch collections) vì
                // chỉ cần check id để xác nhận có trùng không
                return jpaRepo.findByProfileUrl(profileUrl).map(mapper::toDomain);
        }

        @Override
        public CandidateProfile save(CandidateProfile profile) {
                CandidateProfileJpaEntity entity;

                if (profile.getId() != null && jpaRepo.existsById(profile.getId())) {
                        entity = jpaRepo.getReferenceById(profile.getId());
                        mapper.updateEntity(entity, profile);
                } else {
                        entity = mapper.toNewEntity(profile);
                }

                return mapper.toDomain(jpaRepo.save(entity));
        }

        @Override
        public void deleteById(UUID id) {
                jpaRepo.deleteById(id);
        }
}