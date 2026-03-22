package edu.tlu.jobplatform.candidate.domain.repository;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;

import java.util.Optional;
import java.util.UUID;

public interface CandidateProfileRepository {

    Optional<CandidateProfile> findById(UUID id);

    Optional<CandidateProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    CandidateProfile save(CandidateProfile profile);

    void deleteById(UUID id);

    boolean existsByProfileUrl(String profileUrl);

    Optional<CandidateProfile> findByProfileUrl(String profileUrl);
}