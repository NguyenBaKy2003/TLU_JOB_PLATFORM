package edu.tlu.jobplatform.shared.event.subscription;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

/**
 * Domain Event: CandidateSubscription hết hạn.
 * Published bởi CandidateSubscriptionScheduler sau khi expire.
 * Consumed bởi CandidateSubscriptionEmailHandler để gửi email nhắc nhở.
 */
@Getter
@RequiredArgsConstructor
public class CandidateSubscriptionExpiredEvent {
    private final UUID candidateId;
    private final String planCode;
}