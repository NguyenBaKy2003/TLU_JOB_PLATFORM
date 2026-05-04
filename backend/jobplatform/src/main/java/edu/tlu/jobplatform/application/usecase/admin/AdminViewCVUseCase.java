package edu.tlu.jobplatform.application.usecase.admin;

import edu.tlu.jobplatform.shared.port.FileStoragePort;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.UUID;

/**
 * Admin xem bất kỳ CV nào để kiểm duyệt vi phạm.
 * Không cần kiểm tra ownership.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminViewCVUseCase {

    private final CandidateCVRepository cvRepo;
    private final FileStoragePort fileStorage;

    public record Result(
            InputStream inputStream,
            String fileName,
            String contentType,
            long contentLength) {
    }

    @Transactional(readOnly = true)
    public Result execute(UUID cvId) {
        CandidateCV cv = cvRepo.findById(cvId)
                .orElseThrow(() -> ResourceNotFoundException.of("CV", cvId));

        if (cv.getFileUrl() == null || cv.getFileUrl().isBlank())
            throw new BusinessRuleException("CV này không có file đính kèm.", "CV_NO_FILE");

        FileStoragePort.FileResult file = fileStorage.download(cv.getFileUrl());
        String fileName = sanitize(cv.getTitle()) + "." + ext(cv.getFileUrl());

        log.info("Admin viewed CV: cvId={} candidateId={}", cvId, cv.getCandidateId());
        return new Result(file.inputStream(), fileName, file.contentType(), file.contentLength());
    }

    private static String sanitize(String s) {
        if (s == null || s.isBlank())
            return "cv";
        return s.trim().replaceAll("[^a-zA-Z0-9À-ỹ\\s._-]", "").replaceAll("\\s+", "_");
    }

    private static String ext(String url) {
        if (url == null)
            return "pdf";
        int dot = url.lastIndexOf('.');
        if (dot < 0 || dot >= url.length() - 1)
            return "pdf";
        return url.substring(dot + 1).split("\\?")[0];
    }
}