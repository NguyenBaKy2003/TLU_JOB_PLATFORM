package edu.tlu.jobplatform.subscription.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.subscription.domain.model.Payment;
import edu.tlu.jobplatform.subscription.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.PaymentJpaEntity;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper.SubscriptionMapper;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.repository.PaymentJpaRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PaymentRepositoryAdapter implements PaymentRepository {

    private final PaymentJpaRepo jpaRepo;
    private final SubscriptionMapper mapper;

    @Override
    public Optional<Payment> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toPaymentDomain);
    }

    @Override
    public Optional<Payment> findPendingByCompanyId(UUID companyId) {
        return jpaRepo.findPendingByCompanyId(companyId).map(mapper::toPaymentDomain);
    }

    @Override
    public Optional<Payment> findByGatewayOrderCode(String code) {
        return jpaRepo.findByGatewayOrderCode(code).map(mapper::toPaymentDomain);
    }

    @Override
    public Payment save(Payment payment) {
        PaymentJpaEntity entity = jpaRepo.findById(payment.getId())
                .map(e -> {
                    mapper.updatePaymentEntity(e, payment);
                    return e;
                })
                .orElseGet(() -> mapper.toPaymentNewEntity(payment));
        return mapper.toPaymentDomain(jpaRepo.save(entity));
    }
}