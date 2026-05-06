package edu.tlu.jobplatform.application.usecase.employer;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.shared.port.FileStoragePort;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.UUID;

/**
 * Employer xem / tải CV của ứng viên đã nộp đơn vào công ty mình.
 *
 * Điều kiện truy cập:
 * 1. Employer phải sở hữu công ty (findByOwnerId)
 * 2. Phải có Application của ứng viên này vào 1 job của công ty đó
 * 3. cvUrl của Application phải khớp với CV được yêu cầu
 *
 * Nếu thiếu 1 trong 3 điều kiện → FORBIDDEN.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ViewCandidateCVUseCase {

    private final ApplicationRepository applicationRepo;
    private final CompanyRepository companyRepo;
    private final CandidateCVRepository cvRepo;
    private final FileStoragePort fileStorage;

    public record Result(
            InputStream inputStream,
            String fileName,
            String contentType,
            long contentLength) {
    }

    /**
     * @param applicationId ID đơn ứng tuyển — dùng để kiểm tra quyền
     * @param cvId          ID CV muốn xem (optional — nếu null, dùng cvUrl từ
     *                      Application)
     */
    @Transactional(readOnly = true)
    public Result execute(UUID applicationId, UUID cvId) {

        // 1. Lấy company của employer hiện tại
        UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
        CompanyProfile company = companyRepo.findByOwnerId(ownerId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Bạn chưa có hồ sơ công ty.", "COMPANY_NOT_FOUND"));

        // 2. Tìm Application và kiểm tra thuộc công ty mình
        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", applicationId));

        if (!app.getCompanyId().equals(company.getId()))
            throw new BusinessRuleException(
                    "Bạn không có quyền xem CV của đơn này.", "FORBIDDEN");

        // 3. Resolve CV URL
        String fileUrl;
        String displayName;

        if (cvId != null) {
            // Xem theo cvId — kiểm tra cvUrl trong Application có chứa cvId không
            CandidateCV cv = cvRepo.findById(cvId)
                    .orElseThrow(() -> ResourceNotFoundException.of("CV", cvId));

            // Bảo vệ: CV này phải thuộc về ứng viên đã nộp đơn
            if (!cv.getCandidateId().equals(app.getCandidateId()))
                throw new BusinessRuleException(
                        "CV này không thuộc về ứng viên đã nộp đơn.", "CV_MISMATCH");

            fileUrl = cv.getFileUrl();
            displayName = sanitizeFileName(cv.getTitle()) + "." + getExtension(cv.getFileUrl());
        } else {
            // Dùng cvUrl trực tiếp từ Application (file đã upload lúc nộp đơn)
            fileUrl = app.getCvUrl();
            displayName = "cv-ung-tuyen." + getExtension(app.getCvUrl());
        }

        if (fileUrl == null || fileUrl.isBlank())
            throw new BusinessRuleException("CV này không có file đính kèm.", "CV_NO_FILE");

        // 4. Download từ storage
        FileStoragePort.FileResult file = fileStorage.download(fileUrl);

        log.info("Employer viewed CV: applicationId={} company={} employer={}",
                applicationId, company.getId(), ownerId);

        return new Result(
                file.inputStream(),
                displayName,
                file.contentType(),
                file.contentLength());
    }

    // ── Helpers

    private static String sanitizeFileName(String title) {
        if (title == null || title.isBlank())
            return "cv";
        return title.trim()
                .replaceAll("[^a-zA-Z0-9À-ỹ\\s._-]", "")
                .replaceAll("\\s+", "_");
    }

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