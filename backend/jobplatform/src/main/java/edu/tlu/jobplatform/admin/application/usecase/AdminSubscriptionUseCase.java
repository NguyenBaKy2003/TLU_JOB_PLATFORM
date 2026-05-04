package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CompanySubscriptionRepository;
import edu.tlu.jobplatform.subscription.domain.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Admin quản lý gói đăng ký:
 * - Xem subscription của công ty
 * - Cấp thêm quota (ưu đãi / bug fix)
 * - Gia hạn thủ công (khách hàng VIP)
 * - Thu hồi subscription vi phạm
 * - Quản lý plan (tạo / ẩn plan)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSubscriptionUseCase {

    private final CompanySubscriptionRepository subscriptionRepo;
    private final SubscriptionPlanRepository planRepo;

    // ── Subscription ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CompanySubscription> listByCompany(UUID companyId) {
        return subscriptionRepo.findByCompanyId(companyId);
    }

    @Transactional(readOnly = true)
    public CompanySubscription getActive(UUID companyId) {
        return subscriptionRepo.findActiveByCompanyId(companyId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Công ty này không có subscription đang active.", "NO_ACTIVE_SUBSCRIPTION"));
    }

    /** Cấp thêm quota đăng bài (hỗ trợ khách hàng, bug fix) */
    @Transactional
    public CompanySubscription grantJobPostQuota(UUID companyId, int amount, String reason) {
        if (amount <= 0 || amount > 100)
            throw new BusinessRuleException("Số quota cấp phải từ 1 đến 100.", "INVALID_AMOUNT");

        CompanySubscription sub = getActive(companyId);
        // Refund N lần để tăng quota (dùng refund logic hiện có)
        for (int i = 0; i < amount; i++)
            sub.refundJobPost(1);
        CompanySubscription saved = subscriptionRepo.save(sub);

        log.info("Admin granted {} job post quota: companyId={} reason='{}'",
                amount, companyId, reason);
        return saved;
    }

    /** Gia hạn thủ công (khách hàng VIP, thanh toán offline) */
    @Transactional
    public CompanySubscription extendExpiry(UUID companyId, int days, String reason) {
        if (days <= 0 || days > 365)
            throw new BusinessRuleException("Số ngày gia hạn phải từ 1 đến 365.", "INVALID_DAYS");

        CompanySubscription sub = subscriptionRepo.findActiveByCompanyId(companyId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Công ty chưa có subscription active để gia hạn.", "NO_ACTIVE_SUBSCRIPTION"));

        CompanySubscription saved = subscriptionRepo.save(sub);

        log.info("Admin extended subscription: companyId={} +{}days reason='{}'",
                companyId, days, reason);
        return saved;
    }

    /** Thu hồi subscription vi phạm */
    @Transactional
    public CompanySubscription revoke(UUID companyId, String reason) {
        if (reason == null || reason.isBlank())
            throw new BusinessRuleException("Vui lòng nhập lý do thu hồi.", "REASON_REQUIRED");

        CompanySubscription sub = getActive(companyId);
        sub.cancel();
        CompanySubscription saved = subscriptionRepo.save(sub);

        log.warn("Admin revoked subscription: companyId={} reason='{}'", companyId, reason);
        return saved;
    }

    // ── Plans ─────

    @Transactional(readOnly = true)
    public List<SubscriptionPlan> listAllPlans() {
        return planRepo.findAllActive();
    }

    @Transactional(readOnly = true)
    public PageResponse<CompanySubscription> listAll(Pageable pageable) {
        Page<CompanySubscription> page = subscriptionRepo.findAll(pageable);
        return PageResponse.from(page);
    }
}