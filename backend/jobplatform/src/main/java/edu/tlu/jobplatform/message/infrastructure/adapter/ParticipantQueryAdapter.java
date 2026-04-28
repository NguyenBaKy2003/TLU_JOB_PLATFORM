// infrastructure/adapter/ParticipantQueryAdapter.java
package edu.tlu.jobplatform.message.infrastructure.adapter;

import edu.tlu.jobplatform.auth.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.message.application.port.out.ParticipantQueryPort;
import edu.tlu.jobplatform.message.presentation.dto.response.ParticipantInfo;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ParticipantQueryAdapter implements ParticipantQueryPort {

        private final CompanyRepository companyProfileRepository;
        private final CandidateProfileRepository candidateProfileRepository;

        // ── Single ─

        @Override
        public ParticipantInfo getEmployer(UUID ownerId) {
                return companyProfileRepository.findByOwnerId(ownerId)
                                .map(c -> new ParticipantInfo(ownerId, c.getName(), c.getLogoUrl()))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy hồ sơ công ty: " + ownerId));
        }

        @Override
        public ParticipantInfo getCandidate(UUID userId) {
                return candidateProfileRepository.findByUserId(userId)
                                .map(c -> new ParticipantInfo(
                                                userId,
                                                (c.getFirstName() + " " + c.getLastName()).trim(),
                                                c.getAvatarUrl()))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy hồ sơ candidate: " + userId));
        }

        // ── Batch ──

        @Override
        public Map<UUID, ParticipantInfo> getEmployersByOwnerIds(Set<UUID> ownerIds) {
                return companyProfileRepository.findAllByOwnerIdIn(ownerIds)
                                .stream()
                                .collect(Collectors.toMap(
                                                c -> c.getOwnerId(),
                                                c -> new ParticipantInfo(c.getOwnerId(), c.getName(), c.getLogoUrl())));
        }

        @Override
        public Map<UUID, ParticipantInfo> getCandidatesByUserIds(Set<UUID> userIds) {
                return candidateProfileRepository.findAllByUserId(userIds)
                                .stream()
                                .collect(Collectors.toMap(
                                                c -> c.getUserId(),
                                                c -> new ParticipantInfo(
                                                                c.getUserId(),
                                                                (c.getFirstName() + " " + c.getLastName()).trim(),
                                                                c.getAvatarUrl())));
        }
}