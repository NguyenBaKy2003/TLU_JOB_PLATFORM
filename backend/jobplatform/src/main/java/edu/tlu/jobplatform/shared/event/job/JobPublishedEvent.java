package edu.tlu.jobplatform.shared.event.job;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Bài đăng tuyển dụng được admin duyệt và publish.
 *
 * Consumers:
 *   - Search domain      → index vào Elasticsearch
 *   - AI domain          → tạo jd_vector embedding
 *   - Notification domain → email NTD xác nhận duyệt
 */
@Getter
public class JobPublishedEvent extends DomainEvent {

    private final UUID   jobPostId;
    private final UUID   companyId;
    private final String title;

    /** Full JD text — AI dùng để tạo embedding */
    private final String jdFullText;

    private final String slug;

    public JobPublishedEvent(UUID jobPostId, UUID companyId,
                             String title, String jdFullText, String slug) {
        super();
        this.jobPostId  = jobPostId;
        this.companyId  = companyId;
        this.title      = title;
        this.jdFullText = jdFullText;
        this.slug       = slug;
    }
}
