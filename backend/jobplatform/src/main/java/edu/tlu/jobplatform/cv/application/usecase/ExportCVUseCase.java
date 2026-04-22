package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.application.port.out.CVRenderPort;
import edu.tlu.jobplatform.cv.application.port.out.CVStoragePort;
import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import edu.tlu.jobplatform.shared.event.cv.CVExportedEvent;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Export CV thành PDF.
 *
 * Flow:
 * 1. Load CV + verify ownership
 * 2. Load template
 * 3. Render HTML → PDF bytes (CVRenderPort)
 * 4. Upload PDF lên S3 (CVStoragePort)
 * 5. Lưu pdfUrl vào CV + publish event
 *
 * Có thể export cả DRAFT (để preview) và PUBLISHED.
 * ARCHIVED CV không thể export.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExportCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVTemplateRepository templateRepository;
    private final CVDomainService cvDomainService;
    private final CVRenderPort cvRenderPort;
    private final CVStoragePort cvStoragePort;
    private final ApplicationEventPublisher eventPublisher;

    /** Trả về URL của file PDF đã tạo */
    public record Result(String pdfUrl, String fileName) {
    }

    @Transactional
    public Result execute(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        if (cv.getStatus() == CVStatus.ARCHIVED) {
            throw new BusinessRuleException(
                    "CV đã bị archive. Không thể xuất PDF.", "CV_ARCHIVED");
        }

        CVTemplate template = templateRepository.findById(cv.getTemplateId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Template không tồn tại.", "TEMPLATE_NOT_FOUND"));

        // Render PDF
        byte[] pdfBytes = cvRenderPort.render(cv, template);

        // Lưu lên S3 (ghi đè file cũ nếu cùng cvId)
        String pdfUrl = cvStoragePort.store(candidateId, cvId, pdfBytes);

        // Cập nhật URL vào CV
        cv.updateExportedPdfUrl(pdfUrl);
        cvRepository.save(cv);

        String fileName = buildFileName(cv);

        eventPublisher.publishEvent(new CVExportedEvent(cvId, candidateId, pdfUrl));

        log.info("OnlineCV exported: cvId={} pdfUrl={}", cvId, pdfUrl);
        return new Result(pdfUrl, fileName);
    }

    private String buildFileName(OnlineCV cv) {
        String title = cv.getTitle() != null
                ? cv.getTitle().replaceAll("[^a-zA-Z0-9\\-_]", "_")
                : "cv";
        return title + "_" + cv.getId().toString().substring(0, 8) + ".pdf";
    }
}