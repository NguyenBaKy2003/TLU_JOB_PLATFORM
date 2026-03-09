package edu.tlu.jobplatform.shared.event.application;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * NTD thay đổi trạng thái đơn ứng tuyển.
 *
 * Consumers:
 *   - Notification domain → email ứng viên thông báo kết quả
 */
@Getter
public class ApplicationStatusChangedEvent extends DomainEvent {

    private final UUID   applicationId;
    private final UUID   candidateId;
    private final String candidateEmail;
    private final String jobTitle;
    private final String oldStatus;
    private final String newStatus;

    /** Ghi chú của NTD khi đổi trạng thái (có thể null) */
    private final String note;

    public ApplicationStatusChangedEvent(UUID applicationId, UUID candidateId,
                                         String candidateEmail, String jobTitle,
                                         String oldStatus, String newStatus,
                                         String note) {
        super();
        this.applicationId  = applicationId;
        this.candidateId    = candidateId;
        this.candidateEmail = candidateEmail;
        this.jobTitle       = jobTitle;
        this.oldStatus      = oldStatus;
        this.newStatus      = newStatus;
        this.note           = note;
    }
}
