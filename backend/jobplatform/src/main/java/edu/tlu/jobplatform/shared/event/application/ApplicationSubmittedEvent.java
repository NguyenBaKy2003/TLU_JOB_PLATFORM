package edu.tlu.jobplatform.shared.event.application;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Ứng viên nộp đơn ứng tuyển thành công.
 *
 * Consumers:
 *   - AI domain           → score CV vs JD (async)
 *   - Job domain          → tăng apply_count
 *   - Notification domain → email NTD "có đơn ứng tuyển mới"
 */
@Getter
public class ApplicationSubmittedEvent extends DomainEvent {

    private final UUID   applicationId;
    private final UUID   jobPostId;
    private final UUID   candidateId;
    private final UUID   cvId;
    private final UUID   companyId;
    private final String jobTitle;
    private final String candidateName;
    private final String employerEmail;

    public ApplicationSubmittedEvent(UUID applicationId, UUID jobPostId,
                                     UUID candidateId, UUID cvId, UUID companyId,
                                     String jobTitle, String candidateName,
                                     String employerEmail) {
        super();
        this.applicationId = applicationId;
        this.jobPostId     = jobPostId;
        this.candidateId   = candidateId;
        this.cvId          = cvId;
        this.companyId     = companyId;
        this.jobTitle      = jobTitle;
        this.candidateName = candidateName;
        this.employerEmail = employerEmail;
    }
}
