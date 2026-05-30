package edu.tlu.jobplatform.payment.application.usecase.employer;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.payment.presentation.dto.response.PaymentResponse;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employer xem lịch sử thanh toán của công ty mình.
 * companyId resolve từ ownerId — không thể xem công ty khác.
 *
 * listMyPayments → trả Page<Payment> (danh sách, không kèm plan)
 * getMyPaymentDetail → trả PaymentResponse kèm SubscriptionSummary
 */
@Service
@RequiredArgsConstructor
public class GetMyPaymentsUseCase {

    private final PaymentRepository paymentRepo;
    private final CompanyRepository companyRepo;
    private final SubscriptionPlanRepository planRepository;

    @Transactional(readOnly = true)
    public Page<PaymentResponse> listMyPayments(
            PaymentStatus status,
            String gateway,
            String keyword,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable) {

        UUID companyId = resolveMyCompanyId();
        return paymentRepo
                .searchByCompanyId(companyId, status, gateway, keyword, fromDate, toDate, pageable)
                .map(PaymentResponse::from);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getMyPaymentDetail(UUID paymentId) {
        UUID companyId = resolveMyCompanyId();

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Payment", paymentId));

        // Bảo vệ: chỉ xem được payment của công ty mình
        if (!payment.getCompanyId().equals(companyId))
            throw new BusinessRuleException(
                    "Bạn không có quyền xem giao dịch này.", "FORBIDDEN");

        // Load plan để nhúng SubscriptionSummary
        SubscriptionPlan plan = planRepository
                .findByCode(payment.getPlanCode())
                .orElse(null);

        return PaymentResponse.from(payment, plan);
    }

    // ── Helper ────────────────────────────────────────────────────────

    private UUID resolveMyCompanyId() {
        UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
        CompanyProfile company = companyRepo.findByOwnerId(ownerId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Bạn chưa có hồ sơ công ty.", "COMPANY_NOT_FOUND"));
        return company.getId();
    }
}