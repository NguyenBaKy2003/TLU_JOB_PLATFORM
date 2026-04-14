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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationNotificationHandler {

        private final CreateNotificationUseCase createNotification;
        private final CandidateProfileRepository candidateProfileRepo;
        private final CompanyRepository companyRepository;
        private final JobPostRepository jobPostRepository;

        @Async("taskExecutor")
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void onApplicationSubmitted(ApplicationSubmittedEvent event) {
                CompanyProfile company = companyRepository.findById(event.getCompanyId()).orElse(null);
                if (company == null) {
                        log.warn("onApplicationSubmitted: companyId={} not found, skip", event.getCompanyId());
                        return;
                }

                String candidateName = event.getCandidateName() != null
                                ? event.getCandidateName()
                                : resolveCandidateName(event.getCandidateId());

                String jobTitle = event.getJobTitle() != null
                                ? event.getJobTitle()
                                : resolveJobTitle(event.getJobPostId());

                createNotification.execute(new CreateNotificationUseCase.Command(
                                company.getOwnerId(),
                                NotificationType.NEW_APPLICATION_RECEIVED,
                                "Có ứng viên mới ứng tuyển",
                                "%s vừa nộp đơn vào vị trí %s.".formatted(candidateName, jobTitle),
                                "/employer/applications/" + event.getApplicationId()));
        }

        @Async("taskExecutor")
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void onApplicationStatusChanged(ApplicationStatusChangedEvent event) {
                String jobTitle = event.getJobTitle() != null
                                ? event.getJobTitle()
                                : "vị trí đã ứng tuyển";

                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getCandidateId(),
                                NotificationType.APPLICATION_STATUS_CHANGED,
                                buildStatusTitle(event.getNewStatus()),
                                buildStatusBody(event.getNewStatus(), jobTitle),
                                "/candidate/applications/" + event.getApplicationId()));
        }

        @Async("taskExecutor")
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void onInterviewScheduled(InterviewScheduledEvent event) {
                String jobTitle = event.getJobTitle() != null
                                ? event.getJobTitle()
                                : "vị trí đã ứng tuyển";

                String location = event.getLocation() != null ? event.getLocation() : "Chưa xác định";

                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getCandidateId(),
                                NotificationType.INTERVIEW_SCHEDULED,
                                "Lịch phỏng vấn đã được xếp",
                                "Phỏng vấn cho vị trí %s vào %s. Địa điểm/link: %s"
                                                .formatted(jobTitle, event.getInterviewAt(), location),
                                "/candidate/applications/" + event.getApplicationId()));
        }

        // ── Resolvers ────────────────────────────────────────────────────────────

        private String resolveCandidateName(UUID candidateId) {
                return candidateProfileRepo.findByUserId(candidateId)
                                .map(p -> {
                                        String name = ((p.getFirstName() != null ? p.getFirstName() : "")
                                                        + " " + (p.getLastName() != null ? p.getLastName() : ""))
                                                        .trim();
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

        // ── Helpers ──────────────────────────────────────────────────────────────

        private String buildStatusTitle(String status) {
                return switch (status) {
                        case "REVIEWING" -> "Hồ sơ đang được xem xét";
                        case "SHORTLISTED" -> "Hồ sơ của bạn được chọn vào danh sách rút gọn";
                        case "INTERVIEW_SCHEDULED" -> "Bạn được mời phỏng vấn!";
                        case "INTERVIEWED" -> "Cảm ơn bạn đã tham gia phỏng vấn";
                        case "OFFERED" -> "Chúc mừng! Bạn nhận được offer";
                        case "REJECTED" -> "Kết quả ứng tuyển";
                        case "HIRED" -> "Chúc mừng! Bạn đã được tuyển dụng";
                        default -> "Cập nhật trạng thái ứng tuyển";
                };
        }

        private String buildStatusBody(String status, String jobTitle) {
                return switch (status) {
                        case "REVIEWING" -> "Hồ sơ của bạn cho vị trí %s đang được xem xét.".formatted(jobTitle);
                        case "SHORTLISTED" ->
                                "Hồ sơ của bạn cho vị trí %s đã lọt vào danh sách rút gọn.".formatted(jobTitle);
                        case "INTERVIEW_SCHEDULED" ->
                                "Bạn được mời phỏng vấn cho vị trí %s. Kiểm tra lịch phỏng vấn ngay!"
                                                .formatted(jobTitle);
                        case "INTERVIEWED" ->
                                "Cảm ơn bạn đã tham gia phỏng vấn cho vị trí %s. Chúng tôi sẽ thông báo kết quả sớm."
                                                .formatted(jobTitle);
                        case "OFFERED" ->
                                "Bạn nhận được offer cho vị trí %s. Vào xem chi tiết ngay!".formatted(jobTitle);
                        case "REJECTED" -> "Rất tiếc, hồ sơ của bạn cho vị trí %s không được tiến hành lần này."
                                        .formatted(jobTitle);
                        case "HIRED" -> "Chúc mừng! Bạn chính thức được tuyển vào vị trí %s.".formatted(jobTitle);
                        default -> "Trạng thái đơn ứng tuyển của bạn đã được cập nhật.";
                };
        }
}