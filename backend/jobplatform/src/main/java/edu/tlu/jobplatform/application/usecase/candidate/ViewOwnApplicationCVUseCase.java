package edu.tlu.jobplatform.application.usecase.candidate;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.shared.port.FileStoragePort;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ViewOwnApplicationCVUseCase {

    private final ApplicationRepository applicationRepo;
    private final FileStoragePort fileStorage;

    public record Result(
            InputStream inputStream,
            String fileName,
            String contentType,
            long contentLength) {
    }

    @Transactional(readOnly = true)
    public Result execute(UUID applicationId) {

        // 1. Lấy candidate hiện tại
        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

        // 2. Tìm Application
        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", applicationId));

        // 3. Kiểm tra ownership
        if (!app.getCandidateId().equals(candidateId))
            throw new BusinessRuleException(
                    "Bạn không có quyền xem CV của đơn này.", "FORBIDDEN");

        // 4. Resolve CV URL
        String fileUrl = app.getCvUrl();
        if (fileUrl == null || fileUrl.isBlank())
            throw new BusinessRuleException(
                    "Đơn ứng tuyển này không có CV đính kèm.", "CV_NO_FILE");

        String displayName = "cv-da-nop." + getExtension(fileUrl);

        // 5. Download từ storage
        FileStoragePort.FileResult file = fileStorage.download(fileUrl);

        log.info("Candidate viewed own CV: applicationId={} candidateId={}",
                applicationId, candidateId);

        return new Result(
                file.inputStream(),
                displayName,
                file.contentType(),
                file.contentLength());
    }

    // ── Helpers ───────────

    private static String getExtension(String url) {
        if (url == null)
            return "pdf";
        int dot = url.lastIndexOf('.');
        if (dot < 0 || dot >= url.length() - 1)
            return "pdf";
        String ext = url.substring(dot + 1).split("\\?")[0];
        return ext.isBlank() ? "pdf" : ext;
    }
}