package edu.tlu.jobplatform.candidate.domain.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;

public interface CandidateProfileRepository {

    Optional<CandidateProfile> findById(UUID id);

    Optional<CandidateProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    CandidateProfile save(CandidateProfile profile);

    void deleteById(UUID id);

    boolean existsByProfileUrl(String profileUrl);

    Optional<CandidateProfile> findByProfileUrl(String profileUrl);

    List<CandidateProfile> findAllByUserId(Collection<UUID> userIds);

    Page<CandidateProfile> findByJobSearchStatusIn(List<String> statuses, Pageable pageable);
}