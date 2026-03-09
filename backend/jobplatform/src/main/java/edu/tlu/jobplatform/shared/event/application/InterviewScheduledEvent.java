package edu.tlu.jobplatform.shared.event.application;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * NTD đặt lịch phỏng vấn với ứng viên.
 *
 * Consumers:
 *   - Notification domain → email + calendar invite cho cả 2 bên
 */
@Getter
public class InterviewScheduledEvent extends DomainEvent {

    private final UUID   applicationId;
    private final UUID   candidateId;
    private final String candidateEmail;
    private final String employerEmail;
    private final String jobTitle;

    /** ISO datetime string: "2026-03-15T14:00:00" */
    private final String interviewAt;

    /** ONLINE hoặc OFFLINE */
    private final String format;

    /** Link Google Meet hoặc địa chỉ văn phòng */
    private final String location;

    public InterviewScheduledEvent(UUID applicationId, UUID candidateId,
                                   String candidateEmail, String employerEmail,
                                   String jobTitle, String interviewAt,
                                   String format, String location) {
        super();
        this.applicationId  = applicationId;
        this.candidateId    = candidateId;
        this.candidateEmail = candidateEmail;
        this.employerEmail  = employerEmail;
        this.jobTitle       = jobTitle;
        this.interviewAt    = interviewAt;
        this.format         = format;
        this.location       = location;
    }
}
