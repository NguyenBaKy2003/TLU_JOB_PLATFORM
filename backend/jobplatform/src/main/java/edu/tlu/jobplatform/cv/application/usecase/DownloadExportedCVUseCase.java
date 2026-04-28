package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.shared.port.FileStoragePort;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.UUID;

/**
 * Tai file PDF da export tu S3 ve client.
 * Dung cho GET /cv/{cvId}/view (inline) va GET /cv/{cvId}/download
 * (attachment).
 */
@Service
@RequiredArgsConstructor
public class DownloadExportedCVUseCase {

    private final CVDomainService cvDomainService;
    private final FileStoragePort fileStoragePort;

    public record Result(
            InputStream inputStream,
            String fileName,
            String contentType,
            long contentLength) {
    }

    @Transactional(readOnly = true)
    public Result execute(UUID candidateId, UUID cvId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        if (cv.getExportedPdfUrl() == null || cv.getExportedPdfUrl().isBlank()) {
            throw new BusinessRuleException(
                    "CV chua duoc export. Vui long export truoc.", "CV_NO_PDF");
        }

        FileStoragePort.FileResult file = fileStoragePort.download(cv.getExportedPdfUrl());

        String fileName = sanitizeFileName(cv.getTitle()) + ".pdf";

        return new Result(
                file.inputStream(),
                fileName,
                file.contentType(),
                file.contentLength());
    }

    private static String sanitizeFileName(String title) {
        if (title == null || title.isBlank())
            return "cv";
        return title.trim()
                .replaceAll("[^a-zA-Z0-9\s._-]", "")
                .replaceAll("\s+", "_");
    }
}