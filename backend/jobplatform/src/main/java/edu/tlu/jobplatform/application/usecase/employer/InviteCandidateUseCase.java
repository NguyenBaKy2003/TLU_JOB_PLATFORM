package edu.tlu.jobplatform.application.usecase.employer;

import edu.tlu.jobplatform.application.presentation.dto.response.InviteCandidateResponse;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;
import edu.tlu.jobplatform.shared.email.EmailService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InviteCandidateUseCase {

    private final JobPostRepository jobPostRepo;
    private final CandidateProfileRepository candidateProfileRepo;
    private final CompanyRepository companyRepo;
    private final CreateNotificationUseCase createNotificationUseCase;
    private final EmailService emailService;

    @Transactional
    public InviteCandidateResponse execute(UUID jobPostId, Command cmd) {

        // ── 1. Load & verify job ──────────────────────────────────────────
        JobPost job = jobPostRepo.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        CompanyProfile company = companyRepo.findById(job.getCompanyId())
                .orElseThrow(() -> ResourceNotFoundException.of("Company", job.getCompanyId()));

        // Chỉ owner hoặc admin mới được mời
        if (!SecurityUtils.isOwnerOrAdmin(company.getOwnerId()))
            throw new BusinessRuleException(
                    "Bạn không có quyền mời ứng viên cho bài đăng này.", "FORBIDDEN");

        // Chỉ job PUBLISHED mới được mời
        if (job.getStatus() == null || !"PUBLISHED".equals(job.getStatus().name()))
            throw new BusinessRuleException(
                    "Chỉ có thể mời ứng viên cho bài đăng đang tuyển.", "JOB_NOT_PUBLISHED");

        // ── 2. Load candidate
        // candidateProfileId từ AI search = CandidateProfile.id (không phải userId)
        CandidateProfile candidate = candidateProfileRepo.findById(cmd.candidateProfileId())
                .orElseThrow(() -> ResourceNotFoundException.of("CandidateProfile", cmd.candidateProfileId()));

        String candidateName = buildFullName(candidate);
        String candidateEmail = candidate.getEmail();
        String jobTitle = job.getTitle();
        String companyName = company.getName();

        // Link ứng viên click để xem JD và apply
        String applyLink = buildApplyLink(job.getSlug(), jobPostId);

        // ── 3. Tạo notification (DB + realtime qua event)
        boolean notificationSaved = false;
        try {
            createNotificationUseCase.execute(new CreateNotificationUseCase.Command(
                    candidate.getUserId(),
                    NotificationType.JOB_INVITATION,
                    "Lời mời ứng tuyển từ " + companyName,
                    buildNotificationBody(candidateName, jobTitle, companyName, cmd.personalMessage()),
                    applyLink));
            notificationSaved = true;
            log.info("Invite notification saved: candidateUserId={} jobPostId={}",
                    candidate.getUserId(), jobPostId);
        } catch (Exception e) {
            log.error("Failed to save invite notification: candidateUserId={} error={}",
                    candidate.getUserId(), e.getMessage());
        }

        // ── 4. Dispatch email async
        boolean emailDispatched = false;
        if (candidateEmail != null && !candidateEmail.isBlank()) {
            emailService.sendJobInvitationEmail(
                    candidateEmail,
                    candidateName,
                    jobTitle,
                    companyName,
                    applyLink,
                    cmd.personalMessage());
            emailDispatched = true;
            log.info("Invite email dispatched: to={} jobPostId={}", candidateEmail, jobPostId);
        } else {
            log.warn("Candidate has no email — skip email: candidateProfileId={}", cmd.candidateProfileId());
        }

        return InviteCandidateResponse.builder()
                .jobPostId(jobPostId)
                .candidateProfileId(cmd.candidateProfileId())
                .candidateName(candidateName)
                .jobTitle(jobTitle)
                .emailDispatched(emailDispatched)
                .notificationSaved(notificationSaved)
                .invitedAt(LocalDateTime.now())
                .build();
    }

    // ── Helpers

    private String buildFullName(CandidateProfile p) {
        String first = p.getFirstName() != null ? p.getFirstName() : "";
        String last = p.getLastName() != null ? p.getLastName() : "";
        String full = (first + " " + last).trim();
        return full.isBlank() ? "Ứng viên" : full;
    }

    private String buildApplyLink(String slug, UUID jobPostId) {
        return "/jobs/" + jobPostId.toString();
    }

    private String buildNotificationBody(String candidateName, String jobTitle,
            String companyName, String personalMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append(companyName).append(" đã mời bạn ứng tuyển vào vị trí \"")
                .append(jobTitle).append("\".");
        if (personalMessage != null && !personalMessage.isBlank()) {
            sb.append(" Lời nhắn: ").append(personalMessage);
        }
        return sb.toString();
    }

    public record Command(UUID candidateProfileId, String personalMessage) {
    }
}