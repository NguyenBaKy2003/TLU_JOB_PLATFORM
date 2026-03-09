package edu.tlu.jobplatform.shared.event.subscription;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Gói dịch vụ được kích hoạt sau khi thanh toán thành công.
 *
 * Consumers:
 *   - Notification domain → email invoice, chào mừng nâng cấp
 */
@Getter
public class SubscriptionActivatedEvent extends DomainEvent {

    private final UUID          companyId;
    private final String        companyEmail;
    private final String        planName;
    private final LocalDateTime expiresAt;
    private final int           jobPostLimit;
    private final UUID          paymentId;

    public SubscriptionActivatedEvent(UUID companyId, String companyEmail,
                                      String planName, LocalDateTime expiresAt,
                                      int jobPostLimit, UUID paymentId) {
        super();
        this.companyId    = companyId;
        this.companyEmail = companyEmail;
        this.planName     = planName;
        this.expiresAt    = expiresAt;
        this.jobPostLimit = jobPostLimit;
        this.paymentId    = paymentId;
    }
}
