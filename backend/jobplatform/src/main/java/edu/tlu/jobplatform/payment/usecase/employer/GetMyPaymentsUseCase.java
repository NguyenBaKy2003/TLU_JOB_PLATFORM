package edu.tlu.jobplatform.payment.usecase.employer;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Employer xem lịch sử thanh toán của công ty mình.
 * Tự động resolve companyId từ ownerId → không thể xem công ty khác.
 */
@Service
@RequiredArgsConstructor
public class GetMyPaymentsUseCase {

    private final PaymentRepository paymentRepo;
    private final CompanyRepository companyRepo;

    @Transactional(readOnly = true)
    public Page<Payment> listMyPayments(PaymentStatus status, Pageable pageable) {
        UUID companyId = resolveMyCompanyId();
        return status != null
                ? paymentRepo.findByCompanyIdAndStatus(companyId, status, pageable)
                : paymentRepo.findByCompanyId(companyId, pageable);
    }

    @Transactional(readOnly = true)
    public Payment getMyPaymentDetail(UUID paymentId) {
        UUID companyId = resolveMyCompanyId();

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Payment", paymentId));

        // Bảo vệ: chỉ xem được payment của công ty mình
        if (!payment.getCompanyId().equals(companyId))
            throw new BusinessRuleException(
                    "Bạn không có quyền xem giao dịch này.", "FORBIDDEN");

        return payment;
    }

    // ── Helper ────────────────────────────────────────────────

    private UUID resolveMyCompanyId() {
        UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
        CompanyProfile company = companyRepo.findByOwnerId(ownerId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Bạn chưa có hồ sơ công ty.", "COMPANY_NOT_FOUND"));
        return company.getId();
    }
}
