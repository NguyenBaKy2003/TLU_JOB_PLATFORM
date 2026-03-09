package edu.tlu.jobplatform.shared.event.job;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Bài đăng hết hạn — phát hiện bởi scheduled job.
 *
 * Consumers:
 *   - Search domain       → xóa khỏi Elasticsearch index
 *   - Notification domain → email NTD thông báo hết hạn, nhắc gia hạn
 *   - AI domain           → đánh dấu vector inactive
 */
@Getter
public class JobExpiredEvent extends DomainEvent {

    private final UUID   jobPostId;
    private final UUID   companyId;
    private final String title;

    public JobExpiredEvent(UUID jobPostId, UUID companyId, String title) {
        super();
        this.jobPostId = jobPostId;
        this.companyId = companyId;
        this.title     = title;
    }
}
