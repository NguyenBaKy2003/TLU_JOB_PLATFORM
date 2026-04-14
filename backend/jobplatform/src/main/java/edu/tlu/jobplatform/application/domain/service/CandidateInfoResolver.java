package edu.tlu.jobplatform.application.domain.service;

import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse.CandidateInfo;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateInfoResolver {

    private final CandidateProfileRepository candidateProfileRepository;

    /** Resolve 1 candidate — dùng cho endpoint get detail */
    public CandidateInfo resolve(UUID userId) {
        return candidateProfileRepository.findByUserId(userId)
                .map((CandidateProfile p) -> CandidateInfo.of(
                        p.getUserId(),
                        p.getFirstName() + p.getLastName(),
                        p.getEmail(),
                        p.getPhone(),
                        p.getAvatarUrl()))
                .orElse(null);
    }

    /** Batch resolve — dùng cho endpoint get list, tránh N+1 */
    public Map<UUID, CandidateInfo> resolveAll(Collection<UUID> userIds) {
        return candidateProfileRepository.findAllByUserId(userIds).stream()
                .collect(Collectors.toMap(
                        CandidateProfile::getUserId,
                        (CandidateProfile p) -> CandidateInfo.of(
                                p.getUserId(),
                                p.getFirstName() + p.getLastName(),
                                p.getEmail(),
                                p.getPhone(),
                                p.getAvatarUrl())));
    }

}