package edu.tlu.jobplatform.application.infrastructure.event;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.shared.event.application.ApplicationStatusChangedEvent;
import edu.tlu.jobplatform.shared.event.application.ApplicationSubmittedEvent;
import edu.tlu.jobplatform.shared.event.application.InterviewScheduledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

/**
 * Publisher wrap Spring's ApplicationEventPublisher.
 *
 * Các field không có sẵn trong Application aggregate (candidateEmail,
 * employerEmail, candidateName, jobTitle) được truyền null — Notification
 * domain tự resolve từ UserRepository / JobPostRepository nếu cần.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationDomainEventPublisher {

    private final ApplicationEventPublisher eventPublisher;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    // ── publishApplicationSubmitted ───────────────────────────

    public void publishApplicationSubmitted(Application app, String jobTitle) {
        eventPublisher.publishEvent(new ApplicationSubmittedEvent(
                app.getId(), // applicationId
                app.getJobPostId(), // jobPostId
                app.getCandidateId(), // candidateId
                null, // cvId — không có trong model
                app.getCompanyId(), // companyId
                jobTitle, // jobTitle
                null, // candidateName — consumer tự resolve
                null // employerEmail — consumer tự resolve
        ));
        log.debug("ApplicationSubmittedEvent fired: {}", app.getId());
    }

    // ── publishStatusChanged ──────────────────────────────────

    public void publishStatusChanged(Application app, ApplicationStatus prevStatus) {
        eventPublisher.publishEvent(new ApplicationStatusChangedEvent(
                app.getId(), // applicationId
                app.getCandidateId(), // candidateId
                null, // candidateEmail — consumer tự resolve
                null, // jobTitle — consumer tự resolve
                prevStatus.name(), // oldStatus
                app.getStatus().name(), // newStatus
                app.getRejectionReason() // note
        ));
        log.debug("ApplicationStatusChangedEvent fired: {} → {}", prevStatus, app.getStatus());
    }

    // ── publishInterviewScheduled ─────────────────────────────

    public void publishInterviewScheduled(Application app) {
        String interviewAt = app.getInterviewScheduledAt() != null
                ? app.getInterviewScheduledAt().format(ISO)
                : null;

        eventPublisher.publishEvent(new InterviewScheduledEvent(
                app.getId(), // applicationId
                app.getCandidateId(), // candidateId
                null, // candidateEmail — consumer tự resolve
                null, // employerEmail — consumer tự resolve
                null, // jobTitle — consumer tự resolve
                interviewAt, // interviewAt (ISO string)
                null, // format (ONLINE/OFFLINE) — không có trong model
                app.getInterviewLocation() // location
        ));
        log.debug("InterviewScheduledEvent fired: applicationId={}", app.getId());
    }
}