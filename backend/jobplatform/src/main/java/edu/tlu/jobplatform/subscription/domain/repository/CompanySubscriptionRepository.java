package edu.tlu.jobplatform.subscription.domain.repository;

import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanySubscriptionRepository {

    Optional<CompanySubscription> findById(UUID id);

    /** Subscription đang ACTIVE của công ty */
    Optional<CompanySubscription> findActiveByCompanyId(UUID companyId);

    /** Tất cả subscription của công ty (để xem lịch sử) */
    List<CompanySubscription> findByCompanyId(UUID companyId);

    /** Tìm subscription sắp hết hạn — dùng bởi scheduler */
    List<CompanySubscription> findByStatusAndExpiresAtBefore(
            SubscriptionStatus status, LocalDateTime threshold);

    CompanySubscription save(CompanySubscription subscription);
}