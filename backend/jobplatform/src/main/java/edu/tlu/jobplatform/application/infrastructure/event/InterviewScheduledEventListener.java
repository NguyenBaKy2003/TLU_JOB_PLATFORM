package edu.tlu.jobplatform.application.infrastructure.event;

import edu.tlu.jobplatform.shared.email.EmailService;
import edu.tlu.jobplatform.shared.event.application.InterviewScheduledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class InterviewScheduledEventListener {

    private final EmailService emailService;

    private static final DateTimeFormatter DISPLAY_FMT = DateTimeFormatter.ofPattern("HH:mm - EEEE, dd/MM/yyyy",
            new Locale("vi"));

    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(InterviewScheduledEvent event) {
        log.debug("Handling InterviewScheduledEvent: applicationId={}", event.getApplicationId());
        try {
            String toEmail = event.getCandidateEmail();
            String candidateName = resolveCandidateName(event);
            String companyName = resolveCompanyName(event);
            String jobTitle = resolveJobTitle(event);
            String scheduledAt = formatInterviewAt(event.getInterviewAt());

            if (toEmail == null) {
                log.warn("Cannot send interview email — candidateEmail not found: applicationId={}. " +
                        "Kiểm tra ApplicationDomainEventPublisher.publishInterviewScheduled()",
                        event.getApplicationId());
                return;
            }

            emailService.sendInterviewScheduledEmail(
                    toEmail,
                    candidateName,
                    jobTitle,
                    companyName,
                    scheduledAt,
                    event.getLocation(),
                    event.getNote());

            log.info("Interview email sent: applicationId={} to={}",
                    event.getApplicationId(), toEmail);

        } catch (Exception e) {
            log.error("Failed to send interview email: applicationId={}",
                    event.getApplicationId(), e);
        }
    }

    private String resolveCandidateName(InterviewScheduledEvent event) {
        String name = event.getCandidateName();
        return (name != null && !name.isBlank()) ? name : "Ứng viên";
    }

    private String resolveCompanyName(InterviewScheduledEvent event) {
        String name = event.getCompanyName();
        return (name != null && !name.isBlank()) ? name : "Nhà tuyển dụng";
    }

    private String resolveJobTitle(InterviewScheduledEvent event) {
        String title = event.getJobTitle();
        return (title != null && !title.isBlank()) ? title : "Vị trí ứng tuyển";
    }

    private String formatInterviewAt(String interviewAt) {
        if (interviewAt == null)
            return "Chưa xác định";
        try {
            return LocalDateTime.parse(interviewAt).format(DISPLAY_FMT);
        } catch (Exception e) {
            log.warn("Cannot parse interviewAt='{}', using raw value", interviewAt);
            return interviewAt;
        }
    }
}