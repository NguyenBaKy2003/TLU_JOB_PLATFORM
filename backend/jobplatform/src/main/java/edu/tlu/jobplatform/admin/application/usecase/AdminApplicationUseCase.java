package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.repository.ApplicationStatusLogRepository;
import edu.tlu.jobplatform.application.domain.service.ApplicationDomainService;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
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
 * - listAll — xem tất cả, filter status + keyword search
 * - listByCompany — xem theo công ty, filter status + keyword
 * - listByJob — xem theo bài đăng, filter status + keyword
 * - overrideStatus — override khi tranh chấp
 * - cancelAllForJob — cancel khi bài vi phạm bị xóa
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminApplicationUseCase {

    private final ApplicationRepository applicationRepo;
    private final ApplicationStatusLogRepository logRepo;
    private final ApplicationDomainService domainService;
    private final UserRepository userRepo;
    private final JobPostRepository jobPostRepo;
    private final CompanyRepository companyRepo;
    // ── Queries

    /**
     * Tất cả đơn trong hệ thống.
     *
     * @param status  null → không lọc status
     * @param keyword null/blank → không lọc keyword
     */
    @Transactional(readOnly = true)
    public Page<Application> listAll(ApplicationStatus status, String keyword, Pageable pageable) {
        return applicationRepo.searchAll(status, keyword, pageable);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse buildFullResponse(Application app) {
        ApplicationDetailResponse.CandidateInfo candidateInfo = userRepo.findById(app.getCandidateId())
                .map(u -> ApplicationDetailResponse.CandidateInfo.of(
                        u.getId(), u.getFullName(), u.getEmail(), null, null, false))
                .orElse(null);

        ApplicationResponse.JobInfo jobInfo = jobPostRepo.findById(app.getJobPostId())
                .map(j -> ApplicationResponse.JobInfo.of(
                        j.getId(),
                        j.getTitle(),
                        j.getSlug(),
                        j.getJobType(), // ← String trực tiếp, không cần .name()
                        j.getLevel(), // ← String trực tiếp
                        j.getWorkLocation() != null ? j.getWorkLocation().getCity() : null))
                .orElse(null);

        ApplicationResponse.CompanyInfo companyInfo = companyRepo.findById(app.getCompanyId())
                .map(c -> ApplicationResponse.CompanyInfo.of(
                        c.getId(), c.getName(), c.getLogoUrl(),
                        c.getIndustry(), c.getWebsite(),
                        c.getSize() != null ? c.getSize().name() : null,
                        c.getCity()))
                .orElse(null);

        return ApplicationResponse.from(app, candidateInfo, jobInfo, companyInfo);
    }

    @Transactional(readOnly = true)
    public ApplicationDetailResponse.CandidateInfo buildCandidateInfo(UUID candidateId) {
        return userRepo.findById(candidateId)
                .map(u -> ApplicationDetailResponse.CandidateInfo.of(
                        u.getId(), u.getFullName(), u.getEmail(), null, null, false))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse.JobInfo buildJobInfo(UUID jobPostId) {
        return jobPostRepo.findById(jobPostId)
                .map(j -> ApplicationResponse.JobInfo.of(
                        j.getId(),
                        j.getTitle(),
                        j.getSlug(),
                        j.getJobType(),
                        j.getLevel(),
                        j.getWorkLocation() != null ? j.getWorkLocation().getCity() : null))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse.CompanyInfo buildCompanyInfo(UUID companyId) {
        return companyRepo.findById(companyId)
                .map(c -> ApplicationResponse.CompanyInfo.of(
                        c.getId(), c.getName(), c.getLogoUrl(),
                        c.getIndustry(), c.getWebsite(),
                        c.getSize() != null ? c.getSize().name() : null,
                        c.getCity()))
                .orElse(null);
    }

    /**
     * Đơn theo công ty.
     *
     * @param status  null → không lọc status
     * @param keyword null/blank → không lọc keyword
     */
    @Transactional(readOnly = true)
    public Page<Application> listByCompany(UUID companyId, ApplicationStatus status,
            String keyword, Pageable pageable) {
        return applicationRepo.searchByCompanyId(companyId, status, keyword, pageable);
    }

    /**
     * Đơn theo bài đăng.
     *
     * @param status  null → không lọc status
     * @param keyword null/blank → không lọc keyword
     */
    @Transactional(readOnly = true)
    public Page<Application> listByJob(UUID jobPostId, ApplicationStatus status,
            String keyword, Pageable pageable) {
        return applicationRepo.searchByJobPostId(jobPostId, status, keyword, pageable);
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

    // ── Commands ──

    /**
     * Admin override status — bypass transition validation, ghi log đầy đủ.
     */
    @Transactional
    public Application overrideStatus(UUID applicationId, ApplicationStatus newStatus, String reason) {
        if (reason == null || reason.isBlank())
            throw new BusinessRuleException("Vui lòng nhập lý do override.", "REASON_REQUIRED");

        Application app = getById(applicationId);
        ApplicationStatus prev = app.getStatus();

        app.updateStatus(newStatus, "[ADMIN] " + reason);
        Application saved = applicationRepo.save(app);

        UUID adminId = SecurityUtils.getCurrentUserIdOrThrow();
        domainService.logStatusChange(saved, prev, "[ADMIN] " + reason, adminId);

        log.warn("Admin overrode application: id={} {} → {} reason='{}'",
                applicationId, prev, newStatus, reason);
        return saved;
    }

    /**
     * Cancel toàn bộ đơn chưa terminal của 1 bài đăng (sau khi force-delete job).
     */
    @Transactional
    public int cancelAllForJob(UUID jobPostId, String reason) {
        Page<Application> apps = applicationRepo.findByJobPostId(jobPostId, Pageable.unpaged());
        UUID adminId = SecurityUtils.getCurrentUserIdOrThrow();
        int count = 0;

        for (Application app : apps) {
            if (!app.getStatus().isTerminal()) {
                ApplicationStatus prev = app.getStatus();
                String note = "[ADMIN] Bài đăng bị xóa: " + reason;
                app.updateStatus(ApplicationStatus.CANCELLED, note);
                applicationRepo.save(app);
                domainService.logStatusChange(app, prev, note, adminId);
                count++;
            }
        }
        log.warn("Admin cancelled {} applications for jobPostId={}", count, jobPostId);
        return count;
    }
}