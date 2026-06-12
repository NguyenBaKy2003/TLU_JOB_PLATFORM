package edu.tlu.jobplatform.candidate.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.entity.CandidateProfileJpaEntity;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.mapper.CandidateMapper;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.repository.CandidateProfileJpaRepository;

import java.util.Collection;
import java.util.List;
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
                return jpaRepo
                                .findByUserIdWithDetails(userId)
                                .map(mapper::toDomain);
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

        @Override
        public List<CandidateProfile> findAllByUserId(Collection<UUID> userIds) {
                return jpaRepo.findAllByUserIdIn(userIds)
                                .stream()
                                .map(mapper::toDomain)
                                .toList();
        }

        @Override
        public Page<CandidateProfile> findByJobSearchStatusIn(
                        List<String> statuses, Pageable pageable) {
                var enumStatuses = statuses == null ? List.<CandidateProfile.JobSearchStatus>of()
                                : statuses.stream()
                                                .map(CandidateProfile.JobSearchStatus::valueOf)
                                                .toList();

                return jpaRepo.findByJobSearchStatusIn(enumStatuses, pageable)
                                .map(mapper::toDomain);
        }
}