package edu.tlu.jobplatform.application.infrastructure.event;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
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
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Lắng nghe InterviewScheduledEvent → resolve thông tin còn thiếu → gửi email
 * cho ứng viên.
 *
 * Pattern:
 * @TransactionalEventListener(AFTER_COMMIT) — chỉ chạy sau khi transaction
 * commit thành công,
 * tránh gửi email khi UseCase bị rollback.
 *
 * @Async("aiTaskExecutor") — không block thread của UseCase,
 * email fail không ảnh hưởng response trả về client.
 *
 * Email được inject sẵn vào CandidateProfile bởi CandidateMapper.toDomain()
 * (query users table theo userId) — listener chỉ cần gọi profile.getEmail().
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InterviewScheduledEventListener {

    private final EmailService emailService;
    private final CandidateProfileRepository candidateRepo;
    private final CompanyRepository companyRepo;

    private static final DateTimeFormatter DISPLAY_FMT = DateTimeFormatter.ofPattern("HH:mm - EEEE, dd/MM/yyyy",
            new Locale("vi"));

    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(InterviewScheduledEvent event) {
        log.debug("Handling InterviewScheduledEvent: applicationId={}", event.getApplicationId());
        try {
            String toEmail = resolveEmail(event);
            String candidateName = resolveCandidateName(event);
            String companyName = resolveCompanyName(event);
            String jobTitle = resolveJobTitle(event);
            String scheduledAt = formatInterviewAt(event.getInterviewAt());

            if (toEmail == null) {
                log.warn("Cannot send interview email — candidateEmail not found: applicationId={}",
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
            // Không re-throw — email fail không được ảnh hưởng luồng chính
            log.error("Failed to send interview email: applicationId={}",
                    event.getApplicationId(), e);
        }
    }

    // ── Resolve helpers ───────────────────────────────────────────────────────

    /**
     * Email được CandidateMapper.toDomain() inject sẵn từ bảng users.
     * Ưu tiên field trong event nếu publisher đã set (future-proof).
     */
    private String resolveEmail(InterviewScheduledEvent event) {
        if (event.getCandidateEmail() != null)
            return event.getCandidateEmail();

        return candidateRepo.findById(event.getCandidateId())
                .map(CandidateProfile::getEmail) // không null nhờ CandidateMapper
                .orElse(null);
    }

    /**
     * Ghép firstName + lastName — CandidateProfile không có getFullName().
     */
    private String resolveCandidateName(InterviewScheduledEvent event) {
        if (event.getCandidateName() != null)
            return event.getCandidateName();

        return candidateRepo.findById(event.getCandidateId())
                .map(c -> Stream.of(c.getFirstName(), c.getLastName())
                        .filter(s -> s != null && !s.isBlank())
                        .collect(Collectors.joining(" ")))
                .filter(s -> !s.isBlank())
                .orElse("Ứng viên");
    }

    private String resolveCompanyName(InterviewScheduledEvent event) {
        if (event.getCompanyName() != null)
            return event.getCompanyName();
        if (event.getCompanyId() == null)
            return "Nhà tuyển dụng";

        return companyRepo.findById(event.getCompanyId())
                .map(CompanyProfile::getName)
                .orElse("Nhà tuyển dụng");
    }

    /**
     * jobTitle không có trong Application aggregate — fallback về chuỗi mặc định.
     * Nếu cần chính xác, truyền jobTitle vào event từ ScheduleInterviewUseCase.
     */
    private String resolveJobTitle(InterviewScheduledEvent event) {
        if (event.getJobTitle() != null)
            return event.getJobTitle();
        return "Vị trí ứng tuyển";
    }

    // ── Format helper ─────────────────────────────────────────────────────────

    /**
     * "2026-04-21T10:00:00" → "10:00 - Thứ Hai, 21/04/2026"
     */
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