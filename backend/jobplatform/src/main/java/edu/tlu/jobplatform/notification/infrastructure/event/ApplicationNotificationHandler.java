package edu.tlu.jobplatform.notification.infrastructure.event;

import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;
import edu.tlu.jobplatform.shared.event.application.ApplicationStatusChangedEvent;
import edu.tlu.jobplatform.shared.event.application.ApplicationSubmittedEvent;
import edu.tlu.jobplatform.shared.event.application.InterviewScheduledEvent;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationNotificationHandler {

    private final CreateNotificationUseCase createNotification;
    private final CandidateProfileRepository candidateProfileRepo;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobPostRepository jobPostRepository;

    @Async("taskExecutor")
    @EventListener
    public void onApplicationSubmitted(ApplicationSubmittedEvent event) {
        CompanyProfile company = companyRepository.findById(event.getCompanyId())
                .orElse(null);
        if (company == null) {
            log.warn("onApplicationSubmitted: companyId={} not found, skip", event.getCompanyId());
            return;
        }

        // Employer email: ưu tiên company.email, fallback user.email
        String employerEmail = company.getEmail() != null
                ? company.getEmail()
                : userRepository.findById(company.getOwnerId())
                        .map(u -> u.getEmail()).orElse(null);

        String candidateName = event.getCandidateName() != null
                ? event.getCandidateName()
                : resolveCandidateName(event.getCandidateId());

        String jobTitle = event.getJobTitle() != null
                ? event.getJobTitle()
                : resolveJobTitle(event.getJobPostId());

        createNotification.execute(new CreateNotificationUseCase.Command(
                company.getOwnerId(),
                employerEmail,
                NotificationType.NEW_APPLICATION_RECEIVED,
                "Có ứng viên mới ứng tuyển",
                "%s vừa nộp đơn vào vị trí %s.".formatted(candidateName, jobTitle),
                "/employer/applications/" + event.getApplicationId()));
    }

    @Async("taskExecutor")
    @EventListener
    public void onApplicationStatusChanged(ApplicationStatusChangedEvent event) {
        String candidateEmail = event.getCandidateEmail() != null
                ? event.getCandidateEmail()
                : resolveCandidateEmail(event.getCandidateId());

        String jobTitle = event.getJobTitle() != null
                ? event.getJobTitle()
                : "vị trí đã ứng tuyển";

        createNotification.execute(new CreateNotificationUseCase.Command(
                event.getCandidateId(),
                candidateEmail,
                NotificationType.APPLICATION_STATUS_CHANGED,
                buildStatusTitle(event.getNewStatus()),
                buildStatusBody(event.getNewStatus(), jobTitle),
                "/candidate/applications/" + event.getApplicationId()));
    }

    @Async("taskExecutor")
    @EventListener
    public void onInterviewScheduled(InterviewScheduledEvent event) {
        String candidateEmail = event.getCandidateEmail() != null
                ? event.getCandidateEmail()
                : resolveCandidateEmail(event.getCandidateId());

        String jobTitle = event.getJobTitle() != null
                ? event.getJobTitle()
                : "vị trí đã ứng tuyển";

        String location = event.getLocation() != null ? event.getLocation() : "Chưa xác định";

        createNotification.execute(new CreateNotificationUseCase.Command(
                event.getCandidateId(),
                candidateEmail,
                NotificationType.INTERVIEW_SCHEDULED,
                "Lịch phỏng vấn đã được xếp",
                "Phỏng vấn cho vị trí %s vào %s. Địa điểm/link: %s"
                        .formatted(jobTitle, event.getInterviewAt(), location),
                "/candidate/applications/" + event.getApplicationId()));
    }

    // ── Resolvers ─────────────────────────────────────────────────────────────

    private String resolveCandidateEmail(UUID candidateId) {
        return candidateProfileRepo.findByUserId(candidateId)
                .map(p -> p.getEmail() != null
                        ? p.getEmail()
                        : userRepository.findById(p.getUserId())
                                .map(u -> u.getEmail()).orElse(null))
                .orElseGet(() -> userRepository.findById(candidateId)
                        .map(u -> u.getEmail()).orElse(null));
    }

    private String resolveCandidateName(UUID candidateId) {
        return candidateProfileRepo.findByUserId(candidateId)
                .map(p -> {
                    String name = ((p.getFirstName() != null ? p.getFirstName() : "")
                            + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                    return name.isBlank() ? "Ứng viên" : name;
                })
                .orElse("Ứng viên");
    }

    private String resolveJobTitle(UUID jobPostId) {
        if (jobPostId == null)
            return "vị trí đã ứng tuyển";
        return jobPostRepository.findById(jobPostId)
                .map(j -> j.getTitle())
                .orElse("vị trí đã ứng tuyển");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String buildStatusTitle(String status) {
        return switch (status) {
            case "REVIEWING" -> "Hồ sơ đang được xem xét";
            case "INTERVIEW" -> "Bạn được mời phỏng vấn!";
            case "OFFERED" -> "Chúc mừng! Bạn nhận được offer";
            case "REJECTED" -> "Kết quả ứng tuyển";
            default -> "Cập nhật trạng thái ứng tuyển";
        };
    }

    private String buildStatusBody(String status, String jobTitle) {
        return switch (status) {
            case "REVIEWING" -> "Hồ sơ của bạn cho vị trí %s đang được xem xét.".formatted(jobTitle);
            case "INTERVIEW" -> "Bạn được mời phỏng vấn cho vị trí %s.".formatted(jobTitle);
            case "OFFERED" -> "Bạn nhận được offer cho vị trí %s. Vào xem chi tiết ngay!".formatted(jobTitle);
            case "REJECTED" ->
                "Rất tiếc, hồ sơ của bạn cho vị trí %s không được tiến hành lần này.".formatted(jobTitle);
            default -> "Trạng thái đơn ứng tuyển của bạn đã được cập nhật.";
        };
    }
}