package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.candidate.application.port.out.FileStoragePort;
import edu.tlu.jobplatform.cv.application.port.out.CVRenderPort;
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
 * Export CV thanh PDF.
 *
 * Flow:
 * - Da co exportedPdfUrl -> download thang tu S3 (khong render lai)
 * - Chua co URL -> render HTML -> PDF bytes -> upload S3 -> luu URL
 *
 * Co the export DRAFT (preview) va PUBLISHED. ARCHIVED thi tu choi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExportCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVTemplateRepository templateRepository;
    private final CVDomainService cvDomainService;
    private final CVRenderPort cvRenderPort;
    private final FileStoragePort fileStoragePort;
    private final ApplicationEventPublisher eventPublisher;

    public record Result(String pdfUrl, String fileName, byte[] pdfBytes) {
    }

    @Transactional
    public Result execute(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        if (cv.getStatus() == CVStatus.ARCHIVED) {
            throw new BusinessRuleException(
                    "CV da bi archive. Khong the xuat PDF.", "CV_ARCHIVED");
        }

        String fileName = buildFileName(cv);

        // Da co PDF -> download thang tu S3
        if (cv.getExportedPdfUrl() != null && !cv.getExportedPdfUrl().isBlank()) {
            try {
                FileStoragePort.FileResult file = fileStoragePort.download(cv.getExportedPdfUrl());
                byte[] pdfBytes = file.inputStream().readAllBytes();
                log.info("CV PDF served from S3 cache: cvId={}", cvId);
                return new Result(cv.getExportedPdfUrl(), fileName, pdfBytes);
            } catch (IOException e) {
                // S3 loi hoac het han -> render lai
                log.warn("Failed to download cached PDF, re-rendering: cvId={} error={}",
                        cvId, e.getMessage());
            }
        }

        // Chua co URL hoac download that bai -> render moi
        CVTemplate template = templateRepository.findById(cv.getTemplateId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Template khong ton tai.", "TEMPLATE_NOT_FOUND"));

        byte[] pdfBytes = cvRenderPort.render(cv, template);

        // Upload S3: folder "cv-exports", fileName = "{cvId}.pdf"
        String pdfUrl = fileStoragePort.upload(
                new java.io.ByteArrayInputStream(pdfBytes),
                cv.getId() + ".pdf",
                "application/pdf",
                "cv-exports");

        cv.updateExportedPdfUrl(pdfUrl);
        cvRepository.save(cv);

        eventPublisher.publishEvent(new CVExportedEvent(cvId, candidateId, pdfUrl));
        log.info("OnlineCV exported: cvId={} pdfUrl={}", cvId, pdfUrl);

        return new Result(pdfUrl, fileName, pdfBytes);
    }

    /**
     * Force re-render: bo qua cache, render lai tu template hien tai.
     * Dung khi template duoc cap nhat hoac noi dung CV thay doi.
     */
    @Transactional
    public Result forceRerender(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        if (cv.getStatus() == CVStatus.ARCHIVED) {
            throw new BusinessRuleException(
                    "CV da bi archive. Khong the xuat PDF.", "CV_ARCHIVED");
        }

        CVTemplate template = templateRepository.findById(cv.getTemplateId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Template khong ton tai.", "TEMPLATE_NOT_FOUND"));

        byte[] pdfBytes = cvRenderPort.render(cv, template);

        String pdfUrl = fileStoragePort.upload(
                new java.io.ByteArrayInputStream(pdfBytes),
                cv.getId() + ".pdf",
                "application/pdf",
                "cv-exports");

        cv.updateExportedPdfUrl(pdfUrl);
        cvRepository.save(cv);

        String fileName = buildFileName(cv);
        eventPublisher.publishEvent(new CVExportedEvent(cvId, candidateId, pdfUrl));
        log.info("OnlineCV force re-rendered: cvId={}", cvId);

        return new Result(pdfUrl, fileName, pdfBytes);
    }

    private String buildFileName(OnlineCV cv) {
        String title = cv.getTitle() != null
                ? cv.getTitle().replaceAll("[^a-zA-Z0-9_-]", "_")
                : "cv";
        return title + "_" + cv.getId().toString().substring(0, 8) + ".pdf";
    }
}