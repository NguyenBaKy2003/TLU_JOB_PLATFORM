package edu.tlu.jobplatform.shared.event.subscription;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: CandidateSubscription được kích hoạt sau thanh toán thành công.
 * Published bởi HandleCandidatePaymentCallbackUseCase.
 * Consumed bởi CandidateSubscriptionEmailHandler để gửi email xác nhận.
 */
@Getter
@RequiredArgsConstructor
public class CandidateSubscriptionActivatedEvent {
    private final UUID candidateId;
    private final String planName;
    private final LocalDateTime expiresAt;
    private final UUID paymentId;
    private final BigDecimal amount;
    private final String gateway;
}