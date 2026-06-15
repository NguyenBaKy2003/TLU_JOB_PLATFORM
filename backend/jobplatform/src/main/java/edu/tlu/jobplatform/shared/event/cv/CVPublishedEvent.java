package edu.tlu.jobplatform.shared.event.cv;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Fired khi CV chuyển từ DRAFT → PUBLISHED.
 *
 * exportedPdfUrl: S3 URL của PDF đã render. Null nếu export thất bại
 * (không block publish flow — scoring sẽ fallback về text extraction).
 */
@Getter
public class CVPublishedEvent extends DomainEvent {

    private final UUID cvId;
    private final UUID candidateId;
    private final String slug;
    private final String exportedPdfUrl;

    public CVPublishedEvent(UUID cvId, UUID candidateId, String slug, String exportedPdfUrl) {
        super(candidateId.toString(), candidateId.toString());
        this.cvId = cvId;
        this.candidateId = candidateId;
        this.slug = slug;
        this.exportedPdfUrl = exportedPdfUrl;
    }
}