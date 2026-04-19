package edu.tlu.jobplatform.application.infrastructure.event;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.event.application.ApplicationStatusChangedEvent;
import edu.tlu.jobplatform.shared.event.application.ApplicationSubmittedEvent;
import edu.tlu.jobplatform.shared.event.application.InterviewScheduledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Publisher wrap Spring's ApplicationEventPublisher.
 *
 * Các field cần thiết (candidateEmail, candidateName, companyName) được resolve
 * TRONG transaction của UseCase — tránh JPA session đã đóng khi listener chạy
 * async.
 *
 * Fix: candidateEmail null → WARN "Cannot send interview email" đã được giải
 * quyết
 * bằng cách resolve sớm tại đây thay vì để listener fallback query ngoài
 * transaction.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationDomainEventPublisher {

    private final ApplicationEventPublisher eventPublisher;
    private final CandidateProfileRepository candidateRepo;
    private final CompanyRepository companyRepo;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    // ── publishApplicationSubmitted ───────────────────────────────────────────

    public void publishApplicationSubmitted(Application app, String jobTitle) {
        eventPublisher.publishEvent(new ApplicationSubmittedEvent(
                app.getId(),
                app.getJobPostId(),
                app.getCandidateId(),
                null, // cvId — không có trong model
                app.getCompanyId(),
                jobTitle,
                null, // candidateName — consumer tự resolve
                null // employerEmail — consumer tự resolve
        ));
        log.debug("ApplicationSubmittedEvent fired: {}", app.getId());
    }

    // ── publishStatusChanged ──────────────────────────────────────────────────

    public void publishStatusChanged(Application app, ApplicationStatus prevStatus) {
        eventPublisher.publishEvent(new ApplicationStatusChangedEvent(
                app.getId(),
                app.getCandidateId(),
                null, // candidateEmail — consumer tự resolve
                null, // jobTitle — consumer tự resolve
                prevStatus.name(),
                app.getStatus().name(),
                app.getRejectionReason()));
        log.debug("ApplicationStatusChangedEvent fired: {} → {}", prevStatus, app.getStatus());
    }

    // ── publishInterviewScheduled ─────────────────────────────────────────────

    /**
     * Resolve candidateEmail, candidateName, companyName TRONG transaction
     * (http-nio thread).
     *
     * Lý do: InterviewScheduledEventListener chạy @Async sau AFTER_COMMIT —
     * lúc đó JPA session đã đóng, CandidateMapper.toDomain() không thể
     * inject email từ bảng users nữa → profile.getEmail() trả về null.
     *
     * Bằng cách resolve tại đây (trong transaction), CandidateMapper.toDomain()
     * hoạt động đúng: query candidate_profiles → query users → inject email.
     */
    public void publishInterviewScheduled(Application app) {
        String interviewAt = app.getInterviewScheduledAt() != null
                ? app.getInterviewScheduledAt().format(ISO)
                : null;

        // Resolve candidate — CandidateMapper.toDomain() inject email từ users table
        CandidateProfile candidate = candidateRepo.findByUserId(app.getCandidateId())
                .orElse(null);

        String candidateEmail = candidate != null ? candidate.getEmail() : null;
        String candidateName = candidate != null
                ? Stream.of(candidate.getFirstName(), candidate.getLastName())
                        .filter(s -> s != null && !s.isBlank())
                        .collect(Collectors.joining(" "))
                : null;

        // Resolve company name
        String companyName = companyRepo.findById(app.getCompanyId())
                .map(CompanyProfile::getName)
                .orElse(null);

        if (candidateEmail == null) {
            log.warn("publishInterviewScheduled: candidateEmail is null for candidateId={}. " +
                    "Email sẽ không được gửi.", app.getCandidateId());
        }

        eventPublisher.publishEvent(new InterviewScheduledEvent(
                app.getId(), // applicationId
                app.getCandidateId(), // candidateId
                app.getCompanyId(), // companyId
                candidateEmail, // ← resolved, không còn null
                candidateName, // ← resolved, không còn null
                null, // employerEmail — không cần cho email này
                companyName, // ← resolved, không còn null
                null, // jobTitle — listener fallback "Vị trí ứng tuyển"
                interviewAt, // ISO string: "2026-04-25T10:29:00"
                null, // format (ONLINE/OFFLINE) — không có trong model
                app.getInterviewLocation(),
                app.getInterviewNote()));

        log.debug("InterviewScheduledEvent fired: applicationId={} to={}",
                app.getId(), candidateEmail);
    }
}