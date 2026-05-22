package edu.tlu.jobplatform.shared.service;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.CompanySize;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.util.SlugUtils;
import edu.tlu.jobplatform.subscription.application.usecase.AssignDefaultCandidatePlanUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.AssignDefaultCompanyPlanUseCase;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
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
    private final CompanyRepository companyRepository;

    // ✅ Inject 2 usecase assign Free plan
    private final AssignDefaultCandidatePlanUseCase assignCandidatePlan;
    private final AssignDefaultCompanyPlanUseCase assignCompanyPlan;

    @Transactional(propagation = Propagation.REQUIRED)
    public void createProfileForUser(User user) {
        if (user == null || user.getId() == null) {
            log.error("Cannot create profile: user is null or missing ID");
            return;
        }

        log.info("Creating profile for user={} role={}", user.getId(), user.getRole());

        try {
            switch (user.getRole()) {
                case CANDIDATE -> {
                    createCandidateProfile(user);
                    assignFreeCandidatePlan(user); // ✅ gán Free plan ngay sau khi tạo profile
                }
                case EMPLOYER -> {
                    createCompanyProfile(user);
                    // Company plan được gán sau khi có companyId
                    // → gọi qua helper riêng bên dưới
                    assignFreeCompanyPlan(user); // ✅
                }
                case ADMIN, SUPER_ADMIN ->
                    log.info("No profile needed for role={}", user.getRole());
                default ->
                    log.warn("Unknown role={} for user={}", user.getRole(), user.getId());
            }
        } catch (Exception e) {
            log.error("Failed to create profile for user={}", user.getId(), e);
            throw e;
        }
    }

    // ── Candidate ─────────────────────────────────────────────────────

    private void createCandidateProfile(User user) {
        if (candidateProfileRepository.existsByUserId(user.getId())) {
            log.info("CandidateProfile already exists for user={}", user.getId());
            return;
        }

        String[] parts = splitFullName(user.getFullName());
        String profileUrl = generateUniqueCandidateSlug(parts[0], parts[1]);

        CandidateProfile profile = CandidateProfile.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .firstName(parts[0])
                .lastName(parts[1])
                .headline("").summary("").location("").avatarUrl("")
                .profileUrl(profileUrl)
                .jobSearchStatus(CandidateProfile.JobSearchStatus.OPEN_TO_OFFERS)
                .expectedSalary(0).currency("VND")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CandidateProfile saved = candidateProfileRepository.save(profile);
        log.info("CandidateProfile created: profileId={} userId={} profileUrl={}",
                saved.getId(), user.getId(), saved.getProfileUrl());
    }

    /**
     * Gán FREE_CANDIDATE plan cho candidate.
     * Tách ra method riêng để:
     * - Lỗi assign plan KHÔNG làm rollback việc tạo profile
     * - Dễ test độc lập
     */
    private void assignFreeCandidatePlan(User user) {
        try {
            assignCandidatePlan.execute(user.getId());
            log.info("FREE_CANDIDATE plan assigned: userId={}", user.getId());
        } catch (Exception e) {
            // Không throw — lỗi plan không được block luồng đăng ký
            log.error("Failed to assign FREE_CANDIDATE plan: userId={} error={}",
                    user.getId(), e.getMessage(), e);
        }
    }

    // ── Company ───────────────────────────────────────────────────────

    private void createCompanyProfile(User user) {
        if (companyRepository.existsByOwnerId(user.getId())) {
            log.info("CompanyProfile already exists for user={}", user.getId());
            return;
        }

        String tempName = (user.getFullName() != null && !user.getFullName().isBlank())
                ? user.getFullName().trim()
                : "company-" + user.getId().toString().substring(0, 8);

        String slug = generateUniqueCompanySlug(tempName);

        CompanyProfile profile = CompanyProfile.builder()
                .id(UUID.randomUUID())
                .ownerId(user.getId())
                .name(tempName).slug(slug)
                .description("").website("").email(user.getEmail())
                .phone("").address("").city("").country("VN").industry("")
                .size(CompanySize.UNKNOWN).foundedYear(null)
                .logoUrl("").coverImageUrl("")
                .verificationStatus(VerificationStatus.UNVERIFIED)
                .rejectionReason(null).verifiedAt(null).verifiedBy(null)
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CompanyProfile saved = companyRepository.save(profile);
        log.info("CompanyProfile created: profileId={} userId={} slug={}",
                saved.getId(), user.getId(), saved.getSlug());
    }

    /**
     * Gán FREE_COMPANY plan cho employer.
     * Cần lấy companyId từ DB vì CompanyProfile vừa được tạo.
     * Tách ra method riêng — lỗi plan không rollback profile.
     */
    private void assignFreeCompanyPlan(User user) {
        try {
            companyRepository.findByOwnerId(user.getId()).ifPresentOrElse(
                    company -> {
                        assignCompanyPlan.execute(company.getId());
                        log.info("FREE_COMPANY plan assigned: companyId={} userId={}",
                                company.getId(), user.getId());
                    },
                    () -> log.error("CompanyProfile not found after creation: userId={}",
                            user.getId()));
        } catch (Exception e) {
            log.error("Failed to assign FREE_COMPANY plan: userId={} error={}",
                    user.getId(), e.getMessage(), e);
        }
    }

    // ── Slug generators ───────────────────────────────────────────────
    // (giữ nguyên — không thay đổi)

    private String generateUniqueCandidateSlug(String firstName, String lastName) {
        String base = (lastName != null && !lastName.isBlank())
                ? SlugUtils.slugify(firstName + " " + lastName)
                : SlugUtils.slugify(firstName);
        String slug = base;
        int suffix = 1;
        while (candidateProfileRepository.existsByProfileUrl(slug)) {
            if (suffix > 100) {
                slug = base + "-" + UUID.randomUUID().toString().substring(0, 8);
                break;
            }
            slug = base + "-" + suffix++;
        }
        return slug;
    }

    private String generateUniqueCompanySlug(String name) {
        String base = SlugUtils.slugify(name);
        String slug = base;
        int suffix = 1;
        while (companyRepository.existsBySlug(slug)) {
            if (suffix > 100) {
                slug = base + "-" + UUID.randomUUID().toString().substring(0, 8);
                break;
            }
            slug = base + "-" + suffix++;
        }
        return slug;
    }

    // ── Helpers ───────────────────────────────────────────────────────
    // (giữ nguyên)

    private static String[] splitFullName(String fullName) {
        if (fullName == null || fullName.isBlank())
            return new String[] { "user", null };
        String trimmed = fullName.trim();
        int space = trimmed.indexOf(' ');
        if (space < 0)
            return new String[] { trimmed, null };
        String first = trimmed.substring(0, space);
        String last = trimmed.substring(space + 1).trim();
        return new String[] { first, last.isEmpty() ? null : last };
    }

    // ── Guards ────────────────────────────────────────────────────────
    // (giữ nguyên toàn bộ)

    public boolean hasProfile(User user) {
        return switch (user.getRole()) {
            case CANDIDATE -> candidateProfileRepository.existsByUserId(user.getId());
            case EMPLOYER -> companyRepository.existsByOwnerId(user.getId());
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

    @Transactional(propagation = Propagation.REQUIRED)
    public void removeProfileForRole(UUID userId, UserRole oldRole) {
        if (userId == null) {
            log.warn("removeProfileForRole: userId is null, skipping");
            return;
        }
        log.info("Removing profile for userId={} oldRole={}", userId, oldRole);
        switch (oldRole) {
            case CANDIDATE -> candidateProfileRepository.findByUserId(userId)
                    .ifPresentOrElse(
                            p -> {
                                candidateProfileRepository.deleteById(p.getId());
                                log.info("Deleted CandidateProfile id={}", p.getId());
                            },
                            () -> log.info("No CandidateProfile found for userId={}", userId));
            case EMPLOYER -> companyRepository.findByOwnerId(userId)
                    .ifPresentOrElse(
                            p -> {
                                companyRepository.deleteById(p.getId());
                                log.info("Deleted CompanyProfile id={}", p.getId());
                            },
                            () -> log.info("No CompanyProfile found for userId={}", userId));
            case ADMIN, SUPER_ADMIN -> log.info("No profile to remove for role={}", oldRole);
            default -> log.warn("Unknown role={} — nothing removed", oldRole);
        }
    }
}