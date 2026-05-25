package edu.tlu.jobplatform.application.domain.service;

import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse.CandidateInfo;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CandidateInfoResolver {

        private final CandidateProfileRepository candidateProfileRepository;

        public CandidateInfo resolve(UUID userId) {
                return candidateProfileRepository.findByUserId(userId)
                                .map(this::toInfo)
                                .orElse(null);
        }

        public Map<UUID, CandidateInfo> resolveAll(Collection<UUID> userIds) {
                return candidateProfileRepository.findAllByUserId(userIds).stream()
                                .collect(Collectors.toMap(
                                                CandidateProfile::getUserId,
                                                this::toInfo));
        }

        private CandidateInfo toInfo(CandidateProfile p) {
                String fullName = Stream.of(p.getFirstName(), p.getLastName())
                                .filter(Objects::nonNull)
                                .collect(Collectors.joining(" "));

                return CandidateInfo.of(
                                p.getUserId(),
                                fullName,
                                p.getEmail(),
                                p.getPhone(),
                                p.getAvatarUrl(),
                                p.isBoosted());
        }
}