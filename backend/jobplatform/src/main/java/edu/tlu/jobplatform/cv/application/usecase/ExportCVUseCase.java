package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.candidate.application.port.out.FileStoragePort;
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
import java.io.IOException;
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
    private final FileStoragePort fileStoragePort; // thêm
    private final ApplicationEventPublisher eventPublisher;

    public record Result(String pdfUrl, String fileName, byte[] pdfBytes) {
    }

    @Transactional
    public Result execute(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        if (cv.getStatus() == CVStatus.ARCHIVED) {
            throw new BusinessRuleException("CV đã bị archive. Không thể xuất PDF.", "CV_ARCHIVED");
        }

        byte[] pdfBytes;

        // Nếu đã có URL → download lại từ S3, không render lại
        if (cv.getExportedPdfUrl() != null && !cv.getExportedPdfUrl().isBlank()) {
            FileStoragePort.FileResult file = fileStoragePort.download(cv.getExportedPdfUrl());
            try {
                pdfBytes = file.inputStream().readAllBytes();
            } catch (IOException e) {
                throw new BusinessRuleException("Không thể đọc file PDF từ S3.", "CV_PDF_READ_ERROR");
            }
            return new Result(cv.getExportedPdfUrl(), buildFileName(cv), pdfBytes);
        }

        // Chưa có URL → render + upload S3
        CVTemplate template = templateRepository.findById(cv.getTemplateId())
                .orElseThrow(() -> new BusinessRuleException("Template không tồn tại.", "TEMPLATE_NOT_FOUND"));

        pdfBytes = cvRenderPort.render(cv, template);

        String pdfUrl = cvStoragePort.store(candidateId, cvId, pdfBytes);
        cv.updateExportedPdfUrl(pdfUrl);
        cvRepository.save(cv);

        String fileName = buildFileName(cv);
        eventPublisher.publishEvent(new CVExportedEvent(cvId, candidateId, pdfUrl));
        log.info("OnlineCV exported: cvId={} pdfUrl={}", cvId, pdfUrl);

        return new Result(pdfUrl, fileName, pdfBytes);
    }

    private String buildFileName(OnlineCV cv) {
        String title = cv.getTitle() != null
                ? cv.getTitle().replaceAll("[^a-zA-Z0-9\\-_]", "_")
                : "cv";
        return title + "_" + cv.getId().toString().substring(0, 8) + ".pdf";
    }
}