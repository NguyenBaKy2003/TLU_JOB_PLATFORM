package edu.tlu.jobplatform.subscription.infrastructure.event;

import edu.tlu.jobplatform.shared.email.EmailService;
import edu.tlu.jobplatform.shared.event.subscription.CandidateSubscriptionActivatedEvent;
import edu.tlu.jobplatform.shared.event.subscription.CandidateSubscriptionExpiredEvent;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;

/**
 * Event Handler: Gửi email thông báo cho Candidate.
 *
 * Khác với SubscriptionEmailHandler (Company) ở chỗ:
 * - Không cần resolve CompanyProfile — candidateId chính là userId
 * - Gửi email trực tiếp từ UserRepository
 *
 * @Async("aiTaskExecutor") — chạy bất đồng bộ, không block transaction chính.
 * @TransactionalEventListener(AFTER_COMMIT) — chỉ gửi khi transaction commit
 * thành công.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CandidateSubscriptionEmailHandler {

    private final EmailService emailService;
    private final UserRepository userRepository;

    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSubscriptionActivated(CandidateSubscriptionActivatedEvent event) {
        resolveCandidate(event.getCandidateId(), user -> emailService.sendCandidateSubscriptionActivatedEmail(
                user.getEmail(),
                user.getFullName(),
                event.getPlanName(),
                event.getExpiresAt(),
                event.getAmount(),
                event.getGateway(),
                event.getPaymentId().toString()));
    }

    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSubscriptionExpired(CandidateSubscriptionExpiredEvent event) {
        resolveCandidate(event.getCandidateId(), user -> emailService.sendCandidateSubscriptionExpiredEmail(
                user.getEmail(),
                user.getFullName(),
                event.getPlanCode()));
    }

    // ── Helper ───────

    @FunctionalInterface
    interface UserConsumer {
        void accept(User user);
    }

    private void resolveCandidate(UUID candidateId, UserConsumer action) {
        try {
            User user = userRepository.findById(candidateId).orElse(null);
            if (user == null) {
                log.warn("[CandidateEmailHandler] User not found: candidateId={}", candidateId);
                return;
            }
            action.accept(user);
        } catch (Exception e) {
            log.error("[CandidateEmailHandler] Failed to send email: candidateId={} error={}",
                    candidateId, e.getMessage(), e);
        }
    }
}