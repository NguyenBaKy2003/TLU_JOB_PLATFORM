package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.subscription.domain.model.CandidateQuota;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.model.Quota;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import edu.tlu.jobplatform.subscription.domain.repository.CompanySubscriptionRepository;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import edu.tlu.jobplatform.user.infrastructure.cache.UserCacheService;
import edu.tlu.jobplatform.user.presentation.dto.SubscriptionSummary;
import edu.tlu.jobplatform.user.presentation.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

/**
 * UseCase: Lấy thông tin user đang đăng nhập.
 *
 * Được gọi từ:
 * - GET /api/users/me — frontend load profile sau khi login
 * - Các domain khác cần thông tin user (Candidate, Company...)
 *
 * Luồng:
 * 1. Tìm trong Redis cache (TTL 10 phút)
 * 2. Cache miss → query PostgreSQL
 * 3. Write-through vào cache
 * 4. Trả về domain User
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GetCurrentUserUseCase {

    private final UserRepository userRepository;
    private final UserCacheService userCacheService;
    private final CandidateSubscriptionRepository candidateSubRepo;
    private final CompanyRepository companyRepo;
    private final CompanySubscriptionRepository companySubRepo;

    @Transactional(readOnly = true)
    public UserResponse execute(UUID userId) {
        User user = userCacheService.get(userId)
                .orElseGet(() -> {
                    User u = userRepository.findById(userId)
                            .orElseThrow(() -> ResourceNotFoundException.user(userId));
                    userCacheService.put(u);
                    return u;
                });

        SubscriptionSummary sub = switch (user.getRole()) {
            case CANDIDATE -> candidateSubRepo
                    .findActiveByCandidate(userId)
                    .map(this::toCandidateSummary)
                    .orElse(null);
            case EMPLOYER -> companyRepo
                    .findByOwnerId(userId)
                    .flatMap(company -> companySubRepo.findActiveByCompanyId(company.getId()))
                    .map(this::toCompanySummary)
                    .orElse(null);
            default -> null;
        };

        return UserResponse.from(user, sub);
    }

    private SubscriptionSummary.Candidate toCandidateSummary(CandidateSubscription s) {
        return SubscriptionSummary.Candidate.builder()
                .id(s.getId())
                .planCode(s.getPlanCode())
                .status(s.getStatus().name())
                .yearly(s.isYearly())
                .expiresAt(s.getExpiresAt())
                .aiCvWriter(s.isAiCvWriter())
                .premiumTemplateAccess(s.isPremiumTemplateAccess())
                .applicationQuota(toQuota(s.getApplicationQuota()))
                .cvBoostQuota(toQuota(s.getCvBoostQuota()))
                .cvCreateQuota(toQuota(s.getCvCreateQuota()))
                .active(s.isActive()).expired(s.isExpired()).free(s.isFree())
                .build();
    }

    private SubscriptionSummary.Company toCompanySummary(CompanySubscription s) {
        return SubscriptionSummary.Company.builder()
                .id(s.getId())
                .planCode(s.getPlanCode())
                .status(s.getStatus().name())
                .yearly(s.isYearly())
                .expiresAt(s.getExpiresAt())
                .aiFeatures(s.isAiFeatures())
                .analyticsAccess(s.isAnalyticsAccess())
                .jobPostQuota(toQuota(s.getJobPostQuota()))
                .featuredJobQuota(toQuota(s.getFeaturedJobQuota()))
                .cvViewQuota(toQuota(s.getCvViewQuota()))
                .active(s.isActive()).expired(s.isExpired()).free(s.isFree())
                .build();
    }

    private SubscriptionSummary.QuotaInfo toQuota(CandidateQuota q) {
        return SubscriptionSummary.QuotaInfo.builder()
                .limit(q.getLimit())
                .used(q.getUsed())
                .exceeded(q.isExceeded())
                .unlimited(q.isUnlimited())
                .build();
    }

    private SubscriptionSummary.QuotaInfo toQuota(Quota q) {
        return SubscriptionSummary.QuotaInfo.builder()
                .limit(q.getLimit())
                .used(q.getUsed())
                .exceeded(q.isExceeded())
                .unlimited(q.isUnlimited())
                .build();
    }
}