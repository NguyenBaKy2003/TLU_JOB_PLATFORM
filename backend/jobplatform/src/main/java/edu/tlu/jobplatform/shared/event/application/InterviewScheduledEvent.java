package edu.tlu.jobplatform.shared.event.application;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * NTD đặt lịch phỏng vấn với ứng viên.
 *
 * Consumers:
 * - Notification domain → email + calendar invite cho cả 2 bên
 *
 * Các field nullable (candidateEmail, candidateName, companyName, jobTitle)
 * được resolve bởi consumer (InterviewScheduledEventListener) từ repository
 * để giữ Application aggregate gọn — không giữ denormalized data.
 */
@Getter
public class InterviewScheduledEvent extends DomainEvent {

    private final UUID applicationId;
    private final UUID candidateId;
    private final UUID companyId; // listener dùng để resolve companyName

    // Nullable — listener tự resolve từ repo nếu null
    private final String candidateEmail;
    private final String candidateName;
    private final String employerEmail;
    private final String companyName;
    private final String jobTitle;

    /** ISO datetime string: "2026-03-15T14:00:00" */
    private final String interviewAt;

    /** ONLINE hoặc OFFLINE */
    private final String format;

    /** Link Google Meet hoặc địa chỉ văn phòng */
    private final String location;

    /** Ghi chú thêm từ nhà tuyển dụng (nullable) */
    private final String note;

    public InterviewScheduledEvent(UUID applicationId,
            UUID candidateId,
            UUID companyId,
            String candidateEmail,
            String candidateName,
            String employerEmail,
            String companyName,
            String jobTitle,
            String interviewAt,
            String format,
            String location,
            String note) {
        super();
        this.applicationId = applicationId;
        this.candidateId = candidateId;
        this.companyId = companyId;
        this.candidateEmail = candidateEmail;
        this.candidateName = candidateName;
        this.employerEmail = employerEmail;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.interviewAt = interviewAt;
        this.format = format;
        this.location = location;
        this.note = note;
    }
}