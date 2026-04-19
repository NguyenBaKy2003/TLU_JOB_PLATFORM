package edu.tlu.jobplatform.payment.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.payment.infrastructure.persistence.repository.PaymentJpaRepo;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper.SubscriptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Adapter implements PaymentRepository port.
 * Dùng SubscriptionMapper đã có để map entity ↔ domain.
 */
@Component
@RequiredArgsConstructor
public class PaymentRepositoryAdapter implements PaymentRepository {

    private final PaymentJpaRepo jpaRepo;
    private final SubscriptionMapper mapper;

    // ── Existing methods ──────────────────────────────────────

    @Override
    public Optional<Payment> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toPaymentDomain);
    }

    @Override
    public Optional<Payment> findByGatewayOrderCode(String orderCode) {
        return jpaRepo.findByGatewayOrderCode(orderCode).map(mapper::toPaymentDomain);
    }

    @Override
    public Optional<Payment> findPendingByCompanyId(UUID companyId) {
        return jpaRepo.findPendingByCompanyId(companyId).map(mapper::toPaymentDomain);
    }

    @Override
    public Payment save(Payment payment) {
        return jpaRepo.findById(payment.getId() != null ? payment.getId() : UUID.randomUUID())
                .map(existing -> {
                    mapper.updatePaymentEntity(existing, payment);
                    return mapper.toPaymentDomain(jpaRepo.save(existing));
                })
                .orElseGet(() -> mapper.toPaymentDomain(jpaRepo.save(mapper.toPaymentNewEntity(payment))));
    }

    // ── Employer ──────────────────────────────────────────────

    @Override
    public Page<Payment> findByCompanyId(UUID companyId, Pageable pageable) {
        return jpaRepo.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable)
                .map(mapper::toPaymentDomain);
    }

    @Override
    public Page<Payment> findByCompanyIdAndStatus(UUID companyId, PaymentStatus status,
            Pageable pageable) {
        return jpaRepo.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, status, pageable)
                .map(mapper::toPaymentDomain);
    }

    // ── Admin ─────────────────────────────────────────────────

    @Override
    public Page<Payment> search(UUID companyId, PaymentStatus status, String gateway,
            LocalDateTime fromDate, LocalDateTime toDate,
            Pageable pageable) {
        return jpaRepo.searchPayments(companyId, status, gateway, fromDate, toDate, pageable)
                .map(mapper::toPaymentDomain);
    }

    @Override
    public BigDecimal sumSuccessAmount(LocalDateTime from, LocalDateTime to) {
        BigDecimal result = jpaRepo.sumSuccessAmount(from, to);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public long countByStatus(PaymentStatus status) {
        return jpaRepo.countByStatus(status);
    }
}
