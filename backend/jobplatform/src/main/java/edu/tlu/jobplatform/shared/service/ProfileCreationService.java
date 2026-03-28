package edu.tlu.jobplatform.shared.service;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.candidate.domain.service.ProfileUrlService;
import edu.tlu.jobplatform.user.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileCreationService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final ProfileUrlService profileUrlService;

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
                case ADMIN, SUPER_ADMIN -> log.info("No profile needed for role={}", user.getRole());
                default -> log.warn("Unknown role={} for user={}", user.getRole(), user.getId());
            }
        } catch (Exception e) {
            log.error("Failed to create profile for user={}", user.getId(), e);
            throw e;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    private void createCandidateProfile(User user) {
        if (candidateProfileRepository.existsByUserId(user.getId())) {
            log.info("CandidateProfile already exists for user={}", user.getId());
            return;
        }

        // Tách firstName / lastName từ fullName
        // "Minh Hằng" → firstName="Minh", lastName="Hằng"
        // "Hằng" → firstName="Hằng", lastName=null
        String[] parts = splitFullName(user.getFullName());
        String firstName = parts[0];
        String lastName = parts[1];

        // Sinh profileUrl ngay khi tạo — không bao giờ để null
        String profileUrl = profileUrlService.generateSlug(firstName, lastName);

        CandidateProfile profile = CandidateProfile.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .firstName(firstName)
                .lastName(lastName)
                .headline("")
                .summary("")
                .location("")
                .avatarUrl("")
                .profileUrl(profileUrl) // ← sinh tự động
                .jobSearchStatus(CandidateProfile.JobSearchStatus.OPEN_TO_OFFERS)
                .expectedSalary(0)
                .currency("VND")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CandidateProfile saved = candidateProfileRepository.save(profile);
        log.info("CandidateProfile created: profileId={} userId={} profileUrl={}",
                saved.getId(), user.getId(), saved.getProfileUrl());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Tách fullName thành [firstName, lastName].
     *
     * Quy tắc:
     * - "Nguyễn Minh Hằng" → ["Nguyễn", "Minh Hằng"] (từ đầu = họ, phần còn lại =
     * tên)
     * - "Hằng" → ["Hằng", null]
     * - null / blank → ["user", null]
     *
     * Lưu ý: Có thể điều chỉnh quy tắc tách tùy theo quy ước đặt tên của hệ thống.
     */
    private static String[] splitFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new String[] { "user", null };
        }

        String trimmed = fullName.trim();
        int space = trimmed.indexOf(' ');

        if (space < 0) {
            return new String[] { trimmed, null };
        }

        String first = trimmed.substring(0, space);
        String last = trimmed.substring(space + 1).trim();
        return new String[] { first, last.isEmpty() ? null : last };
    }

    // ── Guards ────────────────────────────────────────────────────────────────

    public boolean hasProfile(User user) {
        return switch (user.getRole()) {
            case CANDIDATE -> candidateProfileRepository.existsByUserId(user.getId());
            case EMPLOYER -> false;
            case ADMIN, SUPER_ADMIN -> true;
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