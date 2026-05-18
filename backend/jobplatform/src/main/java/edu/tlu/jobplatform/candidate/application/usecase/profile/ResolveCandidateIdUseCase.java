package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResolveCandidateIdUseCase {

    private final CandidateProfileRepository candidateRepo;

    /**
     * Đổi userId (từ JWT) → candidateProfileId.
     * Throw ResourceNotFoundException nếu chưa tạo profile.
     */
    public UUID execute(UUID userId) {
        return candidateRepo.findByUserId(userId)
                .map(p -> p.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("CandidateProfile", userId));
    }
}
