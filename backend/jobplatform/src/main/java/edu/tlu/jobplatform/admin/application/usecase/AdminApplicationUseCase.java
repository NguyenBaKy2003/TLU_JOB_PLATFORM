package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.repository.ApplicationStatusLogRepository;
import edu.tlu.jobplatform.application.domain.service.ApplicationDomainService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Admin quản lý đơn ứng tuyển:
 * - Xem tất cả đơn theo công ty / bài đăng
 * - Override status khi có tranh chấp
 * - Cancel đơn khi bài đăng vi phạm
 * - Xem lịch sử status log
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminApplicationUseCase {

    private final ApplicationRepository applicationRepo;
    private final ApplicationStatusLogRepository logRepo;
    private final ApplicationDomainService domainService;

    @Transactional(readOnly = true)
    public Page<Application> listByCompany(UUID companyId, Pageable pageable) {
        return applicationRepo.findByCompanyId(companyId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Application> listByJob(UUID jobPostId, ApplicationStatus status, Pageable pageable) {
        if (status != null)
            return applicationRepo.findByJobPostIdAndStatus(jobPostId, status, pageable);
        return applicationRepo.findByJobPostId(jobPostId, pageable);
    }

    @Transactional(readOnly = true)
    public Application getById(UUID applicationId) {
        return applicationRepo.findById(applicationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", applicationId));
    }

    @Transactional(readOnly = true)
    public List<ApplicationStatusLog> getStatusLogs(UUID applicationId) {
        return logRepo.findByApplicationId(applicationId);
    }

    /**
     * Admin override status — dùng khi có tranh chấp giữa 2 bên.
     * Không validate transition rules — admin có quyền override.
     */
    @Transactional
    public Application overrideStatus(UUID applicationId, ApplicationStatus newStatus, String reason) {
        if (reason == null || reason.isBlank())
            throw new BusinessRuleException("Vui lòng nhập lý do override.", "REASON_REQUIRED");

        Application app = getById(applicationId);
        ApplicationStatus prevStatus = app.getStatus();

        // Admin bypass transition validation
        app.updateStatus(newStatus, "[ADMIN] " + reason);
        Application saved = applicationRepo.save(app);

        UUID adminId = SecurityUtils.getCurrentUserIdOrThrow();
        domainService.logStatusChange(saved, prevStatus, "[ADMIN] " + reason, adminId);

        log.warn("Admin overrode application status: id={} {} → {} reason='{}'",
                applicationId, prevStatus, newStatus, reason);
        return saved;
    }

    /**
     * Cancel toàn bộ đơn của 1 bài đăng (khi bài vi phạm bị xóa).
     * Gọi sau khi Admin force-delete job.
     */
    @Transactional
    public int cancelAllForJob(UUID jobPostId, String reason) {
        Page<Application> apps = applicationRepo.findByJobPostId(jobPostId, Pageable.unpaged());
        int count = 0;
        for (Application app : apps) {
            if (!app.getStatus().isTerminal()) {
                ApplicationStatus prev = app.getStatus();
                app.updateStatus(ApplicationStatus.CANCELLED, "[ADMIN] Bài đăng bị xóa: " + reason);
                applicationRepo.save(app);
                domainService.logStatusChange(app, prev,
                        "[ADMIN] Bài đăng bị xóa: " + reason,
                        SecurityUtils.getCurrentUserIdOrThrow());
                count++;
            }
        }
        log.warn("Admin cancelled {} applications for jobPostId={}", count, jobPostId);
        return count;
    }
}