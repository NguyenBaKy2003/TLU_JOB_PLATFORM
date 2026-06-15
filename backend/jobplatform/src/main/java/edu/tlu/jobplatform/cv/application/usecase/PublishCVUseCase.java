package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.application.service.CVPdfExportService;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import edu.tlu.jobplatform.shared.event.cv.CVPublishedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Publish CV: DRAFT → PUBLISHED.
 *
 * Flow:
 * 1. Load + verify ownership
 * 2. Domain validate (personalInfo, visible sections)
 * 3. Generate unique slug
 * 4. cv.publish(slug)
 * 5. Export PDF → upload S3 → cv.updateExportedPdfUrl(url)
 * └─ Nếu export lỗi: log warn, tiếp tục (không block publish)
 * 6. Save + publish event
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PublishCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;
    private final ApplicationEventPublisher eventPublisher;
    private final CVPdfExportService pdfExportService;

    @Transactional
    public OnlineCV execute(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        String slug = cvDomainService.generateUniqueSlug(cv.getTitle(), candidateId);
        cv.publish(slug);

        // Export PDF — không throw nếu lỗi để không block việc publish
        String pdfUrl = tryExportPdf(cv);
        if (pdfUrl != null) {
            cv.updateExportedPdfUrl(pdfUrl);
        }

        OnlineCV saved = cvRepository.save(cv);

        eventPublisher.publishEvent(new CVPublishedEvent(
                saved.getId(), saved.getCandidateId(), saved.getSlug(), saved.getExportedPdfUrl()));

        log.info("OnlineCV published: cvId={} slug={} pdfUrl={}",
                saved.getId(), saved.getSlug(), saved.getExportedPdfUrl());
        return saved;
    }

    /**
     * Render PDF và upload S3. Trả về URL nếu thành công, null nếu thất bại.
     * Lỗi ở đây không được lan ra ngoài transaction publish.
     */
    private String tryExportPdf(OnlineCV cv) {
        try {
            return pdfExportService.exportAndUpload(cv);
        } catch (Exception e) {
            log.warn("CV PDF export failed (publish continues): cvId={} error={}",
                    cv.getId(), e.getMessage());
            return null;
        }
    }
}