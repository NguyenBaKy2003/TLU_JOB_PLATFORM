package edu.tlu.jobplatform.subscription.infrastructure.event;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.email.EmailService;
import edu.tlu.jobplatform.shared.event.subscription.PaymentSuccessEvent;
import edu.tlu.jobplatform.shared.event.subscription.SubscriptionActivatedEvent;
import edu.tlu.jobplatform.shared.event.subscription.SubscriptionExpiredEvent;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionEmailHandler {

    private final EmailService emailService;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        resolveOwner(event.getCompanyId(), (owner, company) -> emailService.sendPaymentSuccessEmail(
                owner.getEmail(),
                owner.getFullName(),
                event.getPlanCode(),
                event.getAmount(),
                event.getGateway(),
                event.getPaymentId().toString()));
    }

    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSubscriptionActivated(SubscriptionActivatedEvent event) {
        resolveOwner(event.getCompanyId(), (owner, company) -> emailService.sendSubscriptionActivatedEmail(
                owner.getEmail(),
                owner.getFullName(),
                event.getPlanName(),
                event.getExpiresAt(),
                event.getJobPostLimit()));
    }

    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSubscriptionExpired(SubscriptionExpiredEvent event) {
        resolveOwner(event.getCompanyId(), (owner, company) -> emailService.sendSubscriptionExpiredEmail(
                owner.getEmail(),
                owner.getFullName(),
                event.getPlanCode()));
    }

    // ── Helper ────────

    @FunctionalInterface
    interface OwnerConsumer {
        void accept(User owner, CompanyProfile company);
    }

    private void resolveOwner(java.util.UUID companyId, OwnerConsumer action) {
        try {
            CompanyProfile company = companyRepository.findById(companyId).orElse(null);
            if (company == null) {
                log.warn("Company not found for email: companyId={}", companyId);
                return;
            }
            User owner = userRepository.findById(company.getOwnerId()).orElse(null);
            if (owner == null) {
                log.warn("Owner not found for email: companyId={}", companyId);
                return;
            }
            action.accept(owner, company);
        } catch (Exception e) {
            log.error("Failed to send subscription email: companyId={} error={}",
                    companyId, e.getMessage(), e);
        }
    }
}