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
 * Chỉ truyền các field có sẵn trong Application aggregate.
 * Các field thiếu (candidateEmail, candidateName, companyName, jobTitle)
 * để null — InterviewScheduledEventListener tự resolve từ repository.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationDomainEventPublisher {

    private final ApplicationEventPublisher eventPublisher;

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

    public void publishInterviewScheduled(Application app) {
        String interviewAt = app.getInterviewScheduledAt() != null
                ? app.getInterviewScheduledAt().format(ISO)
                : null;

        eventPublisher.publishEvent(new InterviewScheduledEvent(
                app.getId(), // applicationId
                app.getCandidateId(), // candidateId
                app.getCompanyId(), // companyId ← listener resolve companyName
                null, // candidateEmail — listener resolve
                null, // candidateName — listener resolve
                null, // employerEmail — không cần cho email này
                null, // companyName — listener resolve
                null, // jobTitle — listener resolve
                interviewAt, // ISO string
                null, // format (ONLINE/OFFLINE) — không có trong model
                app.getInterviewLocation(), // location
                app.getInterviewNote() // note
        ));
        log.debug("InterviewScheduledEvent fired: applicationId={}", app.getId());
    }
}