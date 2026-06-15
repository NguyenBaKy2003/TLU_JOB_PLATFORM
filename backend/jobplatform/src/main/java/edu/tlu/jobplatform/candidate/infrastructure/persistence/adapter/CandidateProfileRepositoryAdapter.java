package edu.tlu.jobplatform.candidate.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.CandidateBasicInfo;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.entity.CandidateProfileJpaEntity;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.mapper.CandidateMapper;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.repository.CandidateProfileJpaRepository;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CandidateProfileRepositoryAdapter implements CandidateProfileRepository {

        private final CandidateProfileJpaRepository jpaRepo;
        private final CandidateMapper mapper;
        private final UserRepository userJpaRepo;

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

        @Override
        public List<CandidateProfile> findAiPool(List<String> statuses, int limit) {
                var enumStatuses = statuses.stream()
                                .map(CandidateProfile.JobSearchStatus::valueOf)
                                .toList();

                // Query 1: lấy IDs với pagination
                List<UUID> ids = jpaRepo.findIdsByJobSearchStatusIn(
                                enumStatuses,
                                PageRequest.of(0, limit));

                if (ids.isEmpty())
                        return List.of();

                // Query 2: fetch đầy đủ theo IDs
                List<CandidateProfileJpaEntity> entities = jpaRepo.findAiPoolWithDetails(ids);

                // Batch load users trong 1 query
                Set<UUID> userIds = entities.stream()
                                .map(CandidateProfileJpaEntity::getUserId)
                                .collect(Collectors.toSet());
                Map<UUID, String> emailByUserId = userJpaRepo.findAllByIds(userIds)
                                .stream()
                                .collect(Collectors.toMap(User::getId, User::getEmail));

                return entities.stream()
                                .map(e -> mapper.toDomainWithEmail(e, emailByUserId.get(e.getUserId())))
                                .toList();
        }

        @Override
        public List<CandidateBasicInfo> findBasicInfoByUserIds(Collection<UUID> userIds) {
                if (userIds == null || userIds.isEmpty())
                        return List.of();
                return jpaRepo.findCandidateInfoByUserIds(userIds)
                                .stream()
                                .map(p -> new CandidateBasicInfo(
                                                p.getUserId(),
                                                p.getFirstName(),
                                                p.getLastName(),
                                                p.getEmail(),
                                                p.getPhone(),
                                                p.getAvatarUrl(),
                                                p.getBoostedUntil()))
                                .toList();
        }
}