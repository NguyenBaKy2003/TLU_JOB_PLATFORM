package edu.tlu.jobplatform.application.domain.service;

import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse.CandidateInfo;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.CandidateBasicInfo;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CandidateInfoResolver {

        private final CandidateProfileRepository candidateProfileRepository;

        public Map<UUID, CandidateInfo> resolveAll(Collection<UUID> userIds) {
                return candidateProfileRepository.findBasicInfoByUserIds(userIds)
                                .stream()
                                .collect(Collectors.toMap(
                                                CandidateBasicInfo::userId,
                                                info -> CandidateInfo.of(
                                                                info.userId(),
                                                                Stream.of(info.firstName(), info.lastName())
                                                                                .filter(Objects::nonNull)
                                                                                .collect(Collectors.joining(" ")),
                                                                info.email(),
                                                                info.phone(),
                                                                info.avatarUrl(),
                                                                info.boostedUntil() != null
                                                                                && LocalDateTime.now().isBefore(
                                                                                                info.boostedUntil()))));
        }

        public CandidateInfo resolve(UUID userId) {
                return resolveAll(List.of(userId)).get(userId);
        }
}