package edu.tlu.jobplatform.shared.event.job;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Admin duyệt bài đăng tuyển dụng.
 * Alias ngữ nghĩa của JobPublishedEvent — dùng riêng cho Notification domain.
 *
 * Consumers:
 * - Notification domain → email NTD xác nhận duyệt
 */
@Getter
public class JobPostApprovedEvent extends DomainEvent {

    private final UUID jobPostId;
    private final UUID employerId;
    private final String employerEmail;
    private final String jobTitle;

    public JobPostApprovedEvent(UUID jobPostId, UUID employerId,
            String employerEmail, String jobTitle) {
        super();
        this.jobPostId = jobPostId;
        this.employerId = employerId;
        this.employerEmail = employerEmail;
        this.jobTitle = jobTitle;
    }
}