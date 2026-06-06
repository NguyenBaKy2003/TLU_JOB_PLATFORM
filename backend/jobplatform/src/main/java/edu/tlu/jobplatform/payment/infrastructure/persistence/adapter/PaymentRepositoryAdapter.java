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

@Component
@RequiredArgsConstructor
public class PaymentRepositoryAdapter implements PaymentRepository {

    private final PaymentJpaRepo jpaRepo;
    private final SubscriptionMapper mapper;

    // ── Common ───────

    @Override
    public Optional<Payment> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toPaymentDomain);
    }

    @Override
    public Optional<Payment> findByGatewayOrderCode(String orderCode) {
        return jpaRepo.findByGatewayOrderCode(orderCode).map(mapper::toPaymentDomain);
    }

    @Override
    public Payment save(Payment payment) {
        UUID id = payment.getId();
        if (id != null) {
            return jpaRepo.findById(id)
                    .map(existing -> {
                        mapper.updatePaymentEntity(existing, payment);
                        return mapper.toPaymentDomain(jpaRepo.save(existing));
                    })
                    .orElseGet(() -> mapper.toPaymentDomain(
                            jpaRepo.save(mapper.toPaymentNewEntity(payment))));
        }
        return mapper.toPaymentDomain(jpaRepo.save(mapper.toPaymentNewEntity(payment)));
    }

    // ── Company ──────

    @Override
    public Optional<Payment> findPendingByCompanyId(UUID companyId) {
        return jpaRepo.findPendingByCompanyId(companyId).map(mapper::toPaymentDomain);
    }

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

    // ── Candidate ────

    @Override
    public Optional<Payment> findPendingByCandidateId(UUID candidateId) {
        return jpaRepo.findPendingByCandidateId(candidateId).map(mapper::toPaymentDomain);
    }

    @Override
    public Page<Payment> findByCandidateId(UUID candidateId, Pageable pageable) {
        return jpaRepo.findByCandidateIdOrderByCreatedAtDesc(candidateId, pageable)
                .map(mapper::toPaymentDomain);
    }

    @Override
    public Page<Payment> findByCandidateIdAndStatus(UUID candidateId, PaymentStatus status,
            Pageable pageable) {
        return jpaRepo.findByCandidateIdAndStatusOrderByCreatedAtDesc(candidateId, status, pageable)
                .map(mapper::toPaymentDomain);
    }

    // ── Admin search ─

    @Override
    public Page<Payment> search(UUID companyId, UUID candidateId, PaymentStatus status,
            String gateway, LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable) {
        return jpaRepo.searchPayments(companyId, candidateId, status, gateway,
                fromDate, toDate, pageable)
                .map(mapper::toPaymentDomain);
    }

    @Override
    public Page<Payment> searchByCompanyId(
            UUID companyId, PaymentStatus status, String gateway,
            String keyword, LocalDateTime fromDate, LocalDateTime toDate,
            Pageable pageable) {
        return jpaRepo.searchByCompanyId(
                companyId, status, gateway, keyword, fromDate, toDate, pageable)
                .map(mapper::toPaymentDomain);
    }

    @Override
    public Page<Payment> searchByCandidateId(
            UUID candidateId, PaymentStatus status, String gateway,
            String keyword, LocalDateTime fromDate, LocalDateTime toDate,
            Pageable pageable) {
        return jpaRepo.searchByCandidateId(
                candidateId, status, gateway, keyword, fromDate, toDate, pageable)
                .map(mapper::toPaymentDomain);
    }

    // ── Stats ────────

    @Override
    public BigDecimal sumSuccessAmount(LocalDateTime from, LocalDateTime to) {
        BigDecimal result = jpaRepo.sumSuccessAmount(from, to);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public long countByPeriod(LocalDateTime from, LocalDateTime to) {
        return jpaRepo.countByPeriod(from, to);
    }

    @Override
    public long countByStatusAndPeriod(PaymentStatus status, LocalDateTime from, LocalDateTime to) {
        return jpaRepo.countByStatusAndPeriod(status, from, to);
    }

    @Override
    public long countByStatus(PaymentStatus status) {
        return jpaRepo.countByStatus(status);
    }
}