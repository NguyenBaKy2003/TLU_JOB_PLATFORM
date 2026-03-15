package edu.tlu.jobplatform.shared.event.candidate;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Ứng viên upload CV mới hoặc cập nhật CV.
 *
 * Consumers:
 *   - AI domain → tạo embedding vector từ parsedText
 */
@Getter
public class CVUploadedEvent extends DomainEvent {

    private final UUID    candidateId;
    private final UUID    cvId;

    /** Text đã parse từ PDF — AI dùng để tạo embedding */
    private final String  parsedText;

    /** CV này có phải CV chính (primary) của ứng viên không */
    private final boolean isPrimary;

    public CVUploadedEvent(UUID candidateId, UUID cvId,
                           String parsedText, boolean isPrimary) {
        super();
        this.candidateId = candidateId;
        this.cvId        = cvId;
        this.parsedText  = parsedText;
        this.isPrimary   = isPrimary;
    }
}
