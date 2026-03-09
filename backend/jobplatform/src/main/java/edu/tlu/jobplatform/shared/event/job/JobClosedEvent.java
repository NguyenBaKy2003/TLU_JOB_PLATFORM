package edu.tlu.jobplatform.shared.event.job;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Bài đăng bị đóng thủ công bởi NTD.
 *
 * Consumers:
 *   - Search domain → xóa khỏi Elasticsearch index
 *   - AI domain     → đánh dấu vector inactive
 */
@Getter
public class JobClosedEvent extends DomainEvent {

    private final UUID jobPostId;
    private final UUID companyId;

    public JobClosedEvent(UUID jobPostId, UUID companyId) {
        super();
        this.jobPostId = jobPostId;
        this.companyId = companyId;
    }
}
