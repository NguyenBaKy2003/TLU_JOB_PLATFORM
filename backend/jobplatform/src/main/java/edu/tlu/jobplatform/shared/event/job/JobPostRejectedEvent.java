package edu.tlu.jobplatform.shared.event.job;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Admin từ chối bài đăng tuyển dụng.
 *
 * Consumers:
 * - Notification domain → email NTD thông báo lý do từ chối
 */
@Getter
public class JobPostRejectedEvent extends DomainEvent {

    private final UUID jobPostId;
    private final UUID employerId;
    private final String employerEmail;
    private final String jobTitle;
    private final String reason;

    public JobPostRejectedEvent(UUID jobPostId, UUID employerId,
            String employerEmail, String jobTitle, String reason) {
        super();
        this.jobPostId = jobPostId;
        this.employerId = employerId;
        this.employerEmail = employerEmail;
        this.jobTitle = jobTitle;
        this.reason = reason;
    }
}