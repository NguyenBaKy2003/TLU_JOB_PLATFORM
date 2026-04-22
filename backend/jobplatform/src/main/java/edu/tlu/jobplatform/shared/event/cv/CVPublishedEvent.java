package edu.tlu.jobplatform.shared.event.cv;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Fired khi CV chuyển từ DRAFT → PUBLISHED.
 * Listeners: notification (tuỳ chọn), search index (nếu cần)
 */
@Getter
public class CVPublishedEvent extends DomainEvent {

    private final UUID cvId;
    private final UUID candidateId;
    private final String slug;

    public CVPublishedEvent(UUID cvId, UUID candidateId, String slug) {
        super(candidateId.toString(), candidateId.toString());
        this.cvId = cvId;
        this.candidateId = candidateId;
        this.slug = slug;
    }
}