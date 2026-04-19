package edu.tlu.jobplatform.payment.usecase.admin;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPaymentUseCase {

    private final PaymentRepository paymentRepo;

    // ── Search / List ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<Payment> search(UUID companyId, PaymentStatus status, String gateway,
            LocalDateTime fromDate, LocalDateTime toDate,
            Pageable pageable) {
        return paymentRepo.search(companyId, status, gateway, fromDate, toDate, pageable);
    }

    @Transactional(readOnly = true)
    public Payment getById(UUID paymentId) {
        return paymentRepo.findById(paymentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Payment", paymentId));
    }

    @Transactional(readOnly = true)
    public Page<Payment> getByCompany(UUID companyId, PaymentStatus status, Pageable pageable) {
        return status != null
                ? paymentRepo.findByCompanyIdAndStatus(companyId, status, pageable)
                : paymentRepo.findByCompanyId(companyId, pageable);
    }

    // ── Stats ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Stats getStats(LocalDateTime from, LocalDateTime to) {
        BigDecimal revenue = paymentRepo.sumSuccessAmount(from, to);
        return new Stats(
                revenue != null ? revenue : BigDecimal.ZERO,
                paymentRepo.countByStatus(PaymentStatus.PENDING),
                paymentRepo.countByStatus(PaymentStatus.SUCCESS),
                paymentRepo.countByStatus(PaymentStatus.FAILED),
                paymentRepo.countByStatus(PaymentStatus.REFUNDED),
                from, to);
    }

    // ── Refund (SUPER_ADMIN only) ─────────────────────────────

    @Transactional
    public Payment refund(UUID paymentId, String reason) {
        if (reason == null || reason.isBlank())
            throw new BusinessRuleException(
                    "Vui lòng nhập lý do hoàn tiền.", "REASON_REQUIRED");

        Payment payment = getById(paymentId);

        if (!payment.isSuccess())
            throw new BusinessRuleException(
                    "Chỉ có thể hoàn tiền giao dịch SUCCESS.", "NOT_REFUNDABLE");

        if (payment.getStatus() == PaymentStatus.REFUNDED)
            throw new BusinessRuleException(
                    "Giao dịch đã được hoàn tiền trước đó.", "ALREADY_REFUNDED");

        payment.markFailed("[ADMIN REFUND] " + reason); // dùng markFailed để set status
        // TODO: fire RefundedEvent → notification

        UUID adminId = SecurityUtils.getCurrentUserIdOrThrow();
        log.warn("Admin refunded: paymentId={} amount={} company={} reason='{}' by={}",
                paymentId, payment.getAmount(), payment.getCompanyId(), reason, adminId);

        return paymentRepo.save(payment);
    }

    public record Stats(
            BigDecimal totalRevenue,
            long pendingCount,
            long successCount,
            long failedCount,
            long refundedCount,
            LocalDateTime from,
            LocalDateTime to) {
    }
}
