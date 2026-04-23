package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.candidate.application.port.out.FileStoragePort;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.UUID;

/**
 * Dùng chung cho cả "view" (inline) và "download" (attachment).
 * Controller chịu trách nhiệm set Content-Disposition phù hợp.
 */
@Service
@RequiredArgsConstructor
public class DownloadCVUseCase {

    private final CandidateCVRepository cvRepository;
    private final FileStoragePort fileStorage;

    public record Result(
            InputStream inputStream,
            String fileName,
            String contentType,
            long contentLength) {
    }

    @Transactional(readOnly = true)
    public Result execute(UUID candidateId, UUID cvId) {

        CandidateCV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new BusinessRuleException(
                        "CV không tồn tại.", "CV_NOT_FOUND"));

        // Chỉ candidate sở hữu CV mới được tải
        if (!cv.getCandidateId().equals(candidateId)) {
            throw new BusinessRuleException(
                    "Bạn không có quyền truy cập CV này.", "CV_ACCESS_DENIED");
        }

        if (cv.getFileUrl() == null || cv.getFileUrl().isBlank()) {
            throw new BusinessRuleException(
                    "CV này không có file đính kèm.", "CV_NO_FILE");
        }

        // Lấy file từ S3 qua FileStoragePort
        FileStoragePort.FileResult file = fileStorage.download(cv.getFileUrl());

        // Tên file hiển thị khi download
        String fileName = sanitizeFileName(cv.getTitle()) + "." + getExtension(cv.getFileUrl());

        return new Result(
                file.inputStream(),
                fileName,
                file.contentType(),
                file.contentLength());
    }

    // ── Helpers

    /** Bỏ ký tự đặc biệt khỏi tên file để tránh lỗi Content-Disposition header */
    private static String sanitizeFileName(String title) {
        if (title == null || title.isBlank())
            return "cv";
        return title.trim()
                .replaceAll("[^a-zA-Z0-9À-ỹ\\s._-]", "")
                .replaceAll("\\s+", "_");
    }

    /** Lấy extension từ URL S3: ".../abc.pdf" → "pdf" */
    private static String getExtension(String url) {
        if (url == null)
            return "pdf";
        int dot = url.lastIndexOf('.');
        if (dot < 0 || dot >= url.length() - 1)
            return "pdf";
        String ext = url.substring(dot + 1).split("\\?")[0]; // bỏ query params
        return ext.isBlank() ? "pdf" : ext;
    }
}