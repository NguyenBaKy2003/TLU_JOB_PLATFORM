package edu.tlu.jobplatform.shared.event.cv;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Fired sau khi CV được render thành PDF và upload lên S3.
 * Listeners: notification (gửi link PDF cho candidate), audit log
 */
@Getter
public class CVExportedEvent extends DomainEvent {

    private final UUID cvId;
    private final UUID candidateId;
    private final String pdfUrl;

    public CVExportedEvent(UUID cvId, UUID candidateId, String pdfUrl) {
        super(candidateId.toString(), candidateId.toString());
        this.cvId = cvId;
        this.candidateId = candidateId;
        this.pdfUrl = pdfUrl;
    }
}