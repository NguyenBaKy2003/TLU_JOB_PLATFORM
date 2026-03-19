package edu.tlu.jobplatform.shared.service;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service tạo profile mặc định sau khi đăng ký tài khoản.
 *
 * Hiện tại hỗ trợ:
 * - CANDIDATE → CandidateProfile
 * - EMPLOYER → (Sprint 5)
 * - ADMIN → không cần profile
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileCreationService {

    private final CandidateProfileRepository candidateProfileRepository;
    // Sprint 5: private final EmployerProfileRepository employerProfileRepository;

    @Transactional(propagation = Propagation.REQUIRED)
    public void createProfileForUser(User user) {
        if (user == null || user.getId() == null) {
            log.error("Cannot create profile: user is null or missing ID");
            return;
        }

        log.info("Creating profile for user={} role={}", user.getId(), user.getRole());

        try {
            switch (user.getRole()) {
                case CANDIDATE -> createCandidateProfile(user);
                case EMPLOYER -> log.info("Employer profile — Sprint 5, skipping for now");
                case ADMIN,
                        SUPER_ADMIN ->
                    log.info("No profile needed for role={}", user.getRole());
                default -> log.warn("Unknown role={} for user={}", user.getRole(), user.getId());
            }
        } catch (Exception e) {
            log.error("Failed to create profile for user={}", user.getId(), e);
            throw e;
        }
    }

    // ── Candidate ─────────────────────────────────────────────────

    private void createCandidateProfile(User user) {
        if (candidateProfileRepository.existsByUserId(user.getId())) {
            log.info("CandidateProfile already exists for user={}", user.getId());
            return;
        }

        CandidateProfile profile = CandidateProfile.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .headline("")
                .summary("")
                .phone(user.getPhone() != null ? user.getPhone() : "")
                .location("")
                .avatarUrl("")
                .jobSearchStatus(CandidateProfile.JobSearchStatus.OPEN_TO_OFFERS)
                .expectedSalary(0)
                .currency("VND")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CandidateProfile saved = candidateProfileRepository.save(profile);
        log.info("CandidateProfile created: profileId={} userId={}",
                saved.getId(), user.getId());
    }

    // ── Guards ────────────────────────────────────────────────────

    public boolean hasProfile(User user) {
        return switch (user.getRole()) {
            case CANDIDATE -> candidateProfileRepository.existsByUserId(user.getId());
            case EMPLOYER -> false; // Sprint 5
            case ADMIN,
                    SUPER_ADMIN ->
                true;
            default -> false;
        };
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public boolean ensureProfileExists(User user) {
        if (hasProfile(user)) {
            log.debug("Profile already exists for user={}", user.getId());
            return true;
        }
        createProfileForUser(user);
        return hasProfile(user);
    }
}