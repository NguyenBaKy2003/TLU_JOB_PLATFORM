package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.candidate.application.port.out.FileStoragePort;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DownloadExportedCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final FileStoragePort fileStorage;

    public record Result(
            InputStream inputStream,
            String fileName,
            String contentType,
            long contentLength) {
    }

    @Transactional(readOnly = true)
    public Result execute(UUID candidateId, UUID cvId) {

        OnlineCV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new BusinessRuleException(
                        "CV không tồn tại.", "CV_NOT_FOUND"));

        if (!cv.getCandidateId().equals(candidateId)) {
            throw new BusinessRuleException(
                    "Bạn không có quyền truy cập CV này.", "CV_ACCESS_DENIED");
        }

        if (cv.getExportedPdfUrl() == null || cv.getExportedPdfUrl().isBlank()) {
            throw new BusinessRuleException(
                    "CV chưa được export. Vui lòng export trước.", "CV_NO_PDF");
        }

        FileStoragePort.FileResult file = fileStorage.download(cv.getExportedPdfUrl());

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
                .replaceAll("[^a-zA-Z0-9À-ỹ\\s._-]", "")
                .replaceAll("\\s+", "_");
    }
}