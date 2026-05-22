package edu.tlu.jobplatform.subscription.domain.repository;

import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CompanySubscriptionRepository {
        Optional<CompanySubscription> findById(UUID id);

        Optional<CompanySubscription> findActiveByCompanyId(UUID companyId);

        List<CompanySubscription> findByCompanyId(UUID companyId);

        Page<CompanySubscription> findAll(Pageable pageable);

        List<CompanySubscription> findByPlanCode(String planCode);

        /** Tìm ACTIVE subscription sắp hết hạn — scheduler dùng */
        List<CompanySubscription> findByStatusAndExpiresAtBefore(
                        SubscriptionStatus status, LocalDateTime threshold);

        CompanySubscription save(CompanySubscription subscription);
}
