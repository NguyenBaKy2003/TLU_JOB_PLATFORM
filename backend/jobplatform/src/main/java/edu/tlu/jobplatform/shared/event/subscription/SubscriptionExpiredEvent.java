package edu.tlu.jobplatform.shared.event.subscription;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Gói dịch vụ đã hết hạn — phát hiện bởi scheduled job.
 *
 * Consumers:
 * - Notification domain → nhắc nhở gia hạn gói
 * - Job domain → xử lý các bài đăng featured đang chạy
 */
@Getter
public class SubscriptionExpiredEvent extends DomainEvent {

    private final UUID companyId;
    private final UUID planId;
    private final String planCode;

    public SubscriptionExpiredEvent(UUID companyId, UUID planId, String planCode) {
        super();
        this.companyId = companyId;
        this.planId = planId;
        this.planCode = planCode;
    }
}
