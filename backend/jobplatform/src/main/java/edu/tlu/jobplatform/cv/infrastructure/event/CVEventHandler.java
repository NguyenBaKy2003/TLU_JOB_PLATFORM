package edu.tlu.jobplatform.cv.infrastructure.event;

import edu.tlu.jobplatform.shared.event.cv.CVExportedEvent;
import edu.tlu.jobplatform.shared.event.cv.CVPublishedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Lắng nghe CV domain events và thực hiện side-effects ở infra layer.
 *
 * Mỗi handler chạy @Async để không block transaction gốc.
 * Nếu handler lỗi → chỉ log, không rollback business transaction.
 */
@Slf4j
@Component
public class CVEventHandler {

    /**
     * Khi CV được publish:
     * - Có thể trigger notification cho candidate (nếu cần)
     * - Có thể sync sang search index (nếu CV cần searchable)
     */
    @Async
    @EventListener
    public void onCVPublished(CVPublishedEvent event) {
        log.info("[CVEvent] CV published: cvId={} candidateId={} slug={}",
                event.getCvId(), event.getCandidateId(), event.getSlug());
    }

    /**
     * Khi CV được export PDF:
     * - Log audit
     * - Có thể gửi email kèm link PDF (tuỳ product decision)
     */
    @Async
    @EventListener
    public void onCVExported(CVExportedEvent event) {
        log.info("[CVEvent] CV exported: cvId={} candidateId={} pdfUrl={}",
                event.getCvId(), event.getCandidateId(), event.getPdfUrl());
    }
}